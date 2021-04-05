class CoverData {
    constructor(sourceToken, targetToken, visibleCorners, mostObscuringTile, mostObscuringToken){
      this.SourceToken = sourceToken;
      this.TargetToken = targetToken;
      this.VisibleCorners = visibleCorners;
      this.TileCover = mostObscuringTile;
      this.TokenCover = mostObscuringToken;
      
      // @todo this should possibly be a different class, will need a pass when my cover api is better
      this.Summary = {
        Text: "**UNPROCESSED**",
        Source:  "**NONE**",
        FinalCoverLevel: -1,
        FinalCoverEntity: null
      }
    }
    /**
     * 5e specific conversion of visible corners to a cover value
     * @todo implement in CoverData5e
     * @static
     * @param {Int} visibleCorners
     * @return {Int}
     * @memberof CoverData
     */
    static VisibleCornersToCoverLevel(visibleCorners){
      switch (visibleCorners) {
        case 0: return 3;
        case 1: return 2;
        case 2:
        case 3: return 1;
        case 4: return 0;
        default: console.error(game.i18n.format("DND5EH.LoS_cornererror1")); return null;
      }
    }
  
    /**
     * 5e specific conversion of a generic "coverLevel" to the appropriate string
     * @todo implement in CoverData5e
     * @static
     * @param {Int} coverLevel
     * @return {String} 
     * @memberof CoverData
     */
    static CoverLevelToText(coverLevel) {
      switch (coverLevel) {
        case 0: return game.i18n.format("DND5EH.LoS_nocover");
        case 1: return game.i18n.format("DND5EH.LoS_halfcover");
        case 2: return game.i18n.format("DND5EH.LoS_34cover");
        case 3: return game.i18n.format("DND5EH.LoS_fullcover");
        default: console.error(game.i18n.format("DND5EH.LoS_cornererror2", {coverLevel: coverLevel})); return "";
      }
    }
  
    /** tokenCoverData = {level: number, source: string, entity: token} */
    static SanitizeNPCNames(tokenCoverData){
  
      /** if we are told to hide NPC names and an NPC token is providing cover */
      if (game.settings.get('dnd5e-helpers', 'losMaskNPCs') && 
          tokenCoverData.level > -1 &&
          (tokenCoverData.entity?.actor?.data.type ?? "") == "npc"){
        
        /** change the source of the cover to be a generic "creature" */
        tokenCoverData.source = game.i18n.format("DND5EH.LoSMaskNPCs_sourceMask");
      }
      
      return tokenCoverData;
    }
  
    /**
     * 5e specific interpretation and consideration of all wall and object collisions to produce a final cover value
     * General flow: If line of sight and objects give same cover, prefer line of sight, and select the entity that gives
     *               the greatest amount of cover. Note: cover in 5e does not "sum".
     * @todo implement in CoverData5e
     * @memberof CoverData
     */
    FinalizeData(){
      /** always prefer line of sight because its more accurate at the moment (>= instead of >) */
      const losCoverLevel = CoverData.VisibleCornersToCoverLevel(this.VisibleCorners);
      
      /** assume LOS will be the main blocker */
      let internalCoverData = { level: losCoverLevel, source: `${this.VisibleCorners} visible corners`, entity: null };
      
      /** prepare the secondary blocker information */
      const tileCoverData = { level: this.TileCover?.getFlag('dnd5e-helpers', 'coverLevel') ?? -1, source: `an intervening object`, entity: this.TileCover };
      const obstructionTranslation = game.i18n.format("DND5EH.LoS_obsruct")
      const tokenCoverData = { level: !!this.TokenCover ? 1 : -1, source: `${this.TokenCover?.name ?? ""} ${obstructionTranslation}`, entity: this.TokenCover };
      
      /** prefer walls -> tiles -> tokens in that order */
      if (tileCoverData.level > internalCoverData.level){
        internalCoverData = tileCoverData;
      }
      
      if (tokenCoverData.level > internalCoverData.level){
        internalCoverData = CoverData.SanitizeNPCNames(tokenCoverData);
      }
      
      this.Summary.FinalCoverEntity = internalCoverData.entity;
      this.Summary.FinalCoverLevel = internalCoverData.level;
      this.Summary.Source = internalCoverData.source;
      this.Summary.Text = CoverData.CoverLevelToText(internalCoverData.level);
    }
  
    /**
     * Base chat message output based on a finalized CoverData object. Can be extended if more system specific information
     * is needed in the message.
     *
     * @return {String} 
     * @memberof CoverData
     */
    toMessageContent() {
      /** the cover data must be fully populated and finalized before anything else can happen */
      if (this.FinalCoverLevel < 0) {
        console.error(game.i18n.format("DND5EH.LoS_coverlevelerror1"));
        return "";
      }
  
      /** sanitize an NPC target */
      const sanitizeNPC = function (token){
        const targetName = token.actor?.data.type === "npc" &&
                         game.settings.get('dnd5e-helpers', 'losMaskNPCs') ? game.i18n.format("DND5EH.LoSMaskNPCs_targetMask"): token.name;
        
        return targetName;
      }
  
      /** abuse the dice roll classes to make it look like I know how to UI ;) */
      const sightlineTranslation = game.i18n.format("DND5EH.LoS_outputmessage");
      const content = `<div class="dice-roll"><i>${sanitizeNPC(this.SourceToken)} ${sightlineTranslation} ${sanitizeNPC(this.TargetToken)}</i>
                        <div class="dice-result">
                          <div class="dice-formula">${this.Summary.Text}</div>
                          <div class="dice-tooltip">
                            <div class="dice">${this.Summary.Source}</div></div>`;
      return content;
    }
  };
  
  
  
  async function onTargetToken(user, target, onOff) {
    /** bail immediately if LOS calc is disabled */ 
    if(game.settings.get('dnd5e-helpers', 'losOnTarget') < 1) { return; }
  
    /** currently only concerned with adding a target for the current user */
    if (!onOff || user.id !== game.userId) {
      return;  
    }
    
    for( const selected of canvas.tokens.controlled ) {
      let coverData = await selected.computeTargetCover(target);
      
      /** if we got valid cover data back, finalize and output results */
      if (coverData){
        coverData.FinalizeData();
        const content = coverData.toMessageContent();
        /** whisper the message if we are being a cautious GM */
        if (game.user.isGM && game.settings.get('dnd5e-helpers', 'losMaskNPCs')){
          ChatMessage.create({
            content: content,
            whisper: ChatMessage.getWhisperRecipients('GM')
          });
        } else {
          ChatMessage.create({
            content: content
          });
        }
      }
    }
    
  }
  
  async function DrawDebugRays(drawingList){
    for (let squareRays of drawingList) {
      await canvas.drawings.createMany(squareRays);
    }
  }
  
  /**
   * For a given token, generates two types of grid points
   * GridPoints[]: Each grid intersection point contained within the token's occupied squares (unique)
   * Squares[][]: A list of point quads defining the four corners of each occupied square (points will repeat over shared grid intersections)
   *
   * @param {Token} token
   * @return {{GridPoints: [{x: Number, y: Number},...]}, {Squares: [[{x: Number, y: Number},...],...]}} 
   */
  function generateTokenGrid(token){
  
    /** operate at the origin, then translate at the end */
    const tokenBounds = [token.w, token.h];
    
    /** use token bounds as the limiter */
    let boundingBoxes = [];
    let gridPoints = [];
    
    /** @todo this is hideous. I think a flatmap() or something is what i really want to do */
  
    /** stamp the points out left to right, top to bottom */
    for(let y = 0; y < tokenBounds[1]; y+=canvas.grid.size) {
      for(let x = 0; x < tokenBounds[0]; x+=canvas.grid.size) {
        gridPoints.push([x,y]);
        
        /** create the transformed bounding box. we dont have to do a final pass for that */
        boundingBoxes.push([
          [token.x + x, token.y + y], [token.x + x + canvas.grid.size, token.y + y],
          [token.x + x, token.y + y + canvas.grid.size], [token.x + x + canvas.grid.size, token.y + y + canvas.grid.size]]);
      }
  
      gridPoints.push([token.width,y]);
    }
    
    /** the final grid point row in the token bounds will not be added */
    for(let x = 0; x < tokenBounds[0]; x+=canvas.grid.size) {
        gridPoints.push([x,token.height]);
    }
      
    /** stamp the final point, since we stopped short (handles non-integer sizes) */
    gridPoints.push([token.width, token.height]);
    
    /** offset the entire grid to the token's absolute position */
    gridPoints = gridPoints.map( localPoint => {
      return [localPoint[0] + token.x, localPoint[1] + token.y];
    })
    
    return {GridPoints: gridPoints, Squares: boundingBoxes};
  }
  
  /**
   * Computes the cover value (num visible corners to any occupied grid square) of
   * the specified token if provided, otherwise, the first token in the user's
   * target list.  Can optionally draw each ray tested for cover.
   *
   * @param {Token} [targetToken=null]
   * @param {boolean} [visualize=false]
   * @return {*} 
   */
  Token.prototype.computeTargetCover = async function (targetToken = null, 
                                                       mode = game.settings.get('dnd5e-helpers', 'losOnTarget'),
                                                       includeTiles = game.settings.get('dnd5e-helpers', 'losOnTarget') > 0,
                                                       includeTokens = game.settings.get('dnd5e-helpers', 'losWithTokens'),
                                                       visualize = false) { 
    const myToken = this;
  
    /** if we were not provided a target token, grab the first one the current user has targeted */
    targetToken = !!targetToken ? targetToken : game.user.targets.values().next().value;
  
    if (!targetToken) { ui.noficiations.error(game.i18n.format("DND5EH.LoS_notargeterror")); return false; }
  
    /** dont compute cover on self */
    if(myToken.id == targetToken.id){return false;}
  
    /** generate token grid points */
    /** if we have been called we are computing LOS, use the requested LOS mode (center vs 4 corners) */
    const myTestPoints = mode > 1 ? generateTokenGrid(myToken).GridPoints : [[myToken.center.x, myToken.center.y]];
    const theirTestSquares = generateTokenGrid(targetToken).Squares;
  
    const results = myTestPoints.map( xyPoint => {
      
      /** convert the box entries to num visible corners of itself */
      let individualTests = theirTestSquares.map( square => {
        return ( pointToSquareCover(xyPoint,square,visualize));
      });
      
      /** return the most number of visible corners */
      return Math.max.apply(Math, individualTests);
    });
    
      
    const bestVisibleCorners = Math.max.apply(Math, results);
    
    if(_debugLosRays.length > 0){
      await DrawDebugRays(_debugLosRays);
      _debugLosRays = [];
    } 
  
    const bestCover = CoverFromObjects(myToken, targetToken, includeTiles, includeTokens);
    
    return new CoverData(myToken, targetToken, bestVisibleCorners, bestCover?.bestTile, bestCover?.bestToken);
  }
  
  var _debugLosRays = [];
  
  /**
   * Calculate the number of visible corners of a target grid square from a source point
   *
   * @param {{x: Number, y: Number}} sourcePoint
   * @param {[{x: Number, y: Number}],...} targetSquare
   * @param {boolean} [visualize=false]
   * @return {Number} 
   */
  function pointToSquareCover(sourcePoint, targetSquare, visualize = false) {
  
    /** create pairs of points representing the test structure as source point to target array of points */
    let sightLines = {
      source: sourcePoint,
      targets: targetSquare
    }
  
    /** Debug visualization */
    if (visualize) {
      let debugSightLines = sightLines.targets.map( target => [sightLines.source, target]);
  
      const myCornerDebugRays = debugSightLines.map(ray => {
        return {
          type: CONST.DRAWING_TYPES.POLYGON,
          author: game.user._id,
          x: 0,
          y: 0,
          strokeWidth: 2,
          strokeColor: "#FF0000",
          strokeAlpha: 0.75,
          textColor: "#00FF00",
          points: [ray[0], ray[1]]
        }
      });
  
      _debugLosRays.push(myCornerDebugRays);
    }
    /** \Debug visualization */
  
    /** only restrict vision based on sight blocking walls */
    const options = {
      blockMovement: false,
      blockSenses: true,
      mode: 'any'
    }
  
    let hitResults = sightLines.targets.map(target => {
      const ray = new Ray({ x: sightLines.source[0], y: sightLines.source[1] }, { x: target[0], y: target[1] });
      return WallsLayer.getRayCollisions(ray, options);
    })
  
    const numCornersVisible = hitResults.reduce((total,x) => (x==false ? total+1 : total), 0)
  
    return numCornersVisible;
  }
  
  /**
   * Returns all entities in the list that collide with the ray (ray to bounding box)
   * Object must contain x, y, heigh, width fields.
   * @param {Ray} ray
   * @param {[object]} objectList
   * @return {*} 
   */
  function CollideAgainstObjects(ray, objectList) {
  
    /** terrible intersectors follow */
  
    /** create a padding value to shrink the hitbox corners by -- total of 10% of the grid square size */
    /** this should help with diagonals and degenerate collisions */
    const padding = canvas.grid.size * 0.05;
  
    //create an "x" based on the bounding box (cuts down on 2 collisions per blocker)
    const hitTiles = objectList.filter(tile => {
      /** looking for any collision of this tile's bounds
       *  by creating an "x" from its bounding box
       *  and colliding against those lines */
      //as [[x0,y0,x1,y1],...]
      const boxGroup = [
        [tile.x+padding, tile.y+padding, tile.x + tile.width - padding, tile.y + tile.height - padding],
        [tile.x + tile.width - padding, tile.y+padding, tile.x+padding, tile.y + tile.height-padding],
      ]
  
      return !!boxGroup.find(boxRay => {
        return ray.intersectSegment(boxRay) !== false;
      })});
  
    return hitTiles;
  }
  
  /**
   *
   *
   * @param {*} sourceToken
   * @param {*} targetToken
   * @return {*} 
   */
  function CoverFromObjects(sourceToken, targetToken, includeTiles, includeTokens) {
    /** center to center allows us to run alongside cover calc
      * otherwise we should include cover in the optimal search of cover... */
    const ray = new Ray(sourceToken.center, targetToken.center);
    
    /** create the container to optionally populate with results based on config */
    let objectHitResults = {tiles: null, tokens: null};
  
    if (includeTiles){
      /** collect "blocker" tiles (this could be cached on preCreateTile or preUpdateTile) */
      const coverTiles = canvas.tiles.placeables.filter(tile => tile.getFlag('dnd5e-helpers', 'coverLevel') ?? 0 > 0);
  
      /** hits.length is number of blocker tiles hit */
      objectHitResults.tiles = CollideAgainstObjects(ray, coverTiles);  
    }
    
    if(includeTokens){
      /** collect tokens that are not ourselves OR the target token */
      const coverTokens = canvas.tokens.placeables.filter(token => token.id !== sourceToken.id && token.id !== targetToken.id)
      objectHitResults.tokens = CollideAgainstObjects(ray, coverTokens);
    } 
  
    /** using reduce on an empty array with no starting value is a no go
     *  a starting value (fake tile) is also a no go
     *  so we test and early return null instead.
     */
    const maxCoverLevelTile = objectHitResults.tiles?.length ?? 0 > 0 ? objectHitResults.tiles.reduce( (bestTile, currentTile) => {
      return bestTile?.getFlag('dnd5e-helpers','coverLevel') ?? -1 > currentTile?.getFlag('dnd5e-helpers','coverLevel') ?? -1 ? bestTile : currentTile;
    }) : null;
    
    /** at the moment, we dont care what we hit, since all creatures give 1/2 cover */
    const maxCoverToken = objectHitResults.tokens?.length ?? 0 > 0 ? objectHitResults.tokens[0] : null;
    
    return {bestTile: maxCoverLevelTile, bestToken: maxCoverToken}
  }
  
  /** attaches the cover dropdown to the tile dialog */
  function onRenderTileConfig (tileConfig, html) {
    
    /** 0 = disabled, get out of here if we are disabled */
    if(game.settings.get('dnd5e-helpers', 'losOnTarget') < 1) { return; }
  
    const currentCoverType = tileConfig.object.getFlag('dnd5e-helpers', 'coverLevel');
    
    /** anchor our new dropdown at the bottom of the dialog */
    const saveButton = html.find($('button[type="submit"]'));
    const coverTranslation = game.i18n.format("DND5EH.LoS_providescover");
    const noCover = game.i18n.format("DND5EH.LoS_nocover")
    const halfCover =game.i18n.format("DND5EH.LoS_halfcover")
    const threeQuaterCover =game.i18n.format("DND5EH.LoS_34cover")
    const fullCover =game.i18n.format("DND5EH.LoS_fullcover")
    let checkboxHTML = `<div class="form-group"><label${coverTranslation}</label>
                          <select name="flags.dnd5e-helpers.coverLevel" data-dtype="Number">
                            <option value="0" ${currentCoverType == 0 ? 'selected' : ''}>${noCover}</option>
                            <option value="1" ${currentCoverType == 1 ? 'selected' : ''}>${halfCover}</option>
                            <option value="2" ${currentCoverType == 2 ? 'selected' : ''}>${threeQuaterCover}</option>
                            <option value="3" ${currentCoverType == 3 ? 'selected' : ''}>${fullCover}</option>
                          </select>
                        </div>`;
    
    html.css("height","auto");
  
    saveButton.before(checkboxHTML);
  }
  
  function onPreCreateTile(scene, tileData, options, id){
    const halfPath ="modules/dnd5e-helpers/assets/cover-tiles/half-cover.svg";
    const threePath = "modules/dnd5e-helpers/assets/cover-tiles/three-quarters-cover.svg";
    /** what else could it be? */
    if (tileData.type == "Tile" && (tileData.img == halfPath || tileData.img == threePath)){
      /** its our sample tiles -- set the flag structure */
      const tileCover = tileData.img == halfPath ? 1 : 2;
  
      if (!tileData.flags){
        tileData.flags = {};
      }
  
      tileData.flags["dnd5e-helpers"] = {coverLevel: tileCover};
    }
  }
  
  /** adding cover dropdown to the tile config dialog */
  Hooks.on("renderTileConfig", onRenderTileConfig);
  
  /** calculating cover when a token is targeted */
  Hooks.on("targetToken", onTargetToken);
  
  Hooks.on("preCreateTile", onPreCreateTile);