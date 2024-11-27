import { COORDINATES_MAP, PLAYERS, STEP_LENGTH } from './constants.js';

const diceButtonElement = document.querySelector('#dice-btn');
const resetButtonElement = document.querySelector('#reset-btn');
const playerPiecesContainer = document.querySelector('.player-pieces');
const activePlayerElement = document.querySelector('.active-player span');
const playerBaseElements = document.querySelectorAll('.player-base');
const playerPiecesElements = {
    P1: document.querySelectorAll('[player-id="P1"].player-piece'),
    P2: document.querySelectorAll('[player-id="P2"].player-piece'),
};

export class UI {
    static listenDiceClick(callback) {
        diceButtonElement.addEventListener('click', callback);
    }

    static listenResetClick(callback) {
        resetButtonElement.addEventListener('click', callback);
    }

    static listenPieceClick(callback) {
        playerPiecesContainer.addEventListener('click', callback);
    }

    static setPiecePosition(player, piece, newPosition) {
        const pieceElement = playerPiecesElements[player]?.[piece];
        if (!pieceElement) {
            console.error(`Piece not found: Player=${player}, Piece=${piece}`);
            return;
        }

        const [x, y] = COORDINATES_MAP[newPosition];
        pieceElement.style.cssText = `top: ${y * STEP_LENGTH}%; left: ${x * STEP_LENGTH}%;`;
    }

    static setTurn(index) {
        if (!PLAYERS[index]) {
            console.error('Invalid turn index');
            return;
        }

        const player = PLAYERS[index];
        activePlayerElement.innerText = player;

        // Update player highlight
        playerBaseElements.forEach(base => base.classList.toggle('highlight', base.getAttribute('player-id') === player));
    }

    static enableDice() {
        diceButtonElement.disabled = false;
    }

    static disableDice() {
        diceButtonElement.disabled = true;
    }

    static highlightPieces(player, pieces) {
        pieces.forEach(piece => 
            playerPiecesElements[player]?.[piece]?.classList.add('highlight')
        );
    }

    static unhighlightPieces() {
        document.querySelectorAll('.player-piece.highlight').forEach(piece =>
            piece.classList.remove('highlight')
        );
    }

    static setDiceValue(value) {
        document.querySelector('.dice-value').innerText = value;
    }
}
