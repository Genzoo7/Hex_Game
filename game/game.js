const { generateGraph } = require("../graph/graphGenerator");

class Game {
    constructor(gameID, graph = generateGraph()){
        this.gameID = gameID;
        this.board = graph;
    }

    getGraph(){
        return this.board;
    }

    command(){

    }
}

module.exports = { Game };