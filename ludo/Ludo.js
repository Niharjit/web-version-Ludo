import { 
    BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, 
    START_POSITIONS, STATE, TURNING_POINTS 
} from './constants.js';
import { UI } from './UI.js';

export class Ludo {
    currentPositions = structuredClone(BASE_POSITIONS);
    _diceValue = null;
    _turn = 0;
    _state = STATE.DICE_NOT_ROLLED;

    get diceValue() {
        return this._diceValue;
    }
    set diceValue(value) {
        this._diceValue = value;
        UI.setDiceValue(value);
    }

    get turn() {
        return this._turn;
    }
    set turn(value) {
        this._turn = value;
        UI.setTurn(value);
    }

    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
        value === STATE.DICE_NOT_ROLLED ? UI.enableDice() : UI.disableDice();
        UI.unhighlightPieces();
    }

    constructor() {
        console.log('Welcome to Ludo by Ibrahim !');
        this.initializeListeners();
        this.resetGame();
    }

    initializeListeners() {
        UI.listenDiceClick(() => this.rollDice());
        UI.listenResetClick(() => this.resetGame());
        UI.listenPieceClick((e) => this.handlePieceInteraction(e));
    }

    rollDice() {
        this.diceValue = Math.floor(Math.random() * 6) + 1;
        this.state = STATE.DICE_ROLLED;
        this.highlightEligiblePieces();
    }

    highlightEligiblePieces() {
        const player = PLAYERS[this.turn];
        const eligiblePieces = this.getEligiblePieces(player);
        eligiblePieces.length ? UI.highlightPieces(player, eligiblePieces) : this.nextTurn();
    }

    nextTurn() {
        this.turn = (this.turn + 1) % PLAYERS.length;
        this.state = STATE.DICE_NOT_ROLLED;
    }

    getEligiblePieces(player) {
        return [0, 1, 2, 3].filter(piece => {
            const pos = this.currentPositions[player][piece];
            if (pos === HOME_POSITIONS[player]) return false;
            if (BASE_POSITIONS[player].includes(pos) && this.diceValue !== 6) return false;
            if (HOME_ENTRANCE[player].includes(pos) && this.diceValue > HOME_POSITIONS[player] - pos) return false;
            return true;
        });
    }

    resetGame() {
        console.log('Game reset');
        this.currentPositions = structuredClone(BASE_POSITIONS);
        PLAYERS.forEach(player =>
            [0, 1, 2, 3].forEach(piece => this.setPiecePosition(player, piece, BASE_POSITIONS[player][piece]))
        );
        this.turn = 0;
        this.state = STATE.DICE_NOT_ROLLED;
    }

    handlePieceInteraction(event) {
        const target = event.target;
        if (!target.classList.contains('player-piece') || !target.classList.contains('highlight')) return;

        const player = target.getAttribute('player-id');
        const piece = +target.getAttribute('piece');
        this.movePiece(player, piece);
    }

    movePiece(player, piece) {
        const currentPos = this.currentPositions[player][piece];
        if (BASE_POSITIONS[player].includes(currentPos)) {
            this.setPiecePosition(player, piece, START_POSITIONS[player]);
            this.state = STATE.DICE_NOT_ROLLED;
            return;
        }

        UI.unhighlightPieces();
        let moveBy = this.diceValue;
        const interval = setInterval(() => {
            this.incrementPiecePosition(player, piece);
            if (--moveBy === 0) {
                clearInterval(interval);
                this.finalizeMove(player, piece);
            }
        }, 200);
    }

    finalizeMove(player, piece) {
        if (this.hasPlayerWon(player)) {
            alert(`Player ${player} wins!`);
            this.resetGame();
            return;
        }
        const killed = this.checkForKill(player, piece);
        if (killed || this.diceValue === 6) {
            this.state = STATE.DICE_NOT_ROLLED;
        } else {
            this.nextTurn();
        }
    }

    incrementPiecePosition(player, piece) {
        this.setPiecePosition(player, piece, this.getNextPosition(player, piece));
    }

    getNextPosition(player, piece) {
        const currentPos = this.currentPositions[player][piece];
        if (currentPos === TURNING_POINTS[player]) return HOME_ENTRANCE[player][0];
        if (currentPos === 51) return 0;
        return currentPos + 1;
    }

    checkForKill(player, piece) {
        const pos = this.currentPositions[player][piece];
        const opponent = PLAYERS.find(p => p !== player);

        return [0, 1, 2, 3].some(opponentPiece => {
            const opponentPos = this.currentPositions[opponent][opponentPiece];
            if (pos === opponentPos && !SAFE_POSITIONS.includes(pos)) {
                this.setPiecePosition(opponent, opponentPiece, BASE_POSITIONS[opponent][opponentPiece]);
                return true;
            }
            return false;
        });
    }

    hasPlayerWon(player) {
        return this.currentPositions[player].every(pos => pos === HOME_POSITIONS[player]);
    }

    setPiecePosition(player, piece, position) {
        this.currentPositions[player][piece] = position;
        UI.setPiecePosition(player, piece, position);
    }
}
