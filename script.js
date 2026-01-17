document.addEventListener('DOMContentLoaded', () => {
   
    // --- Game State Variables ---
    let deck = [];
    let currentCardId = null;
    let matchesFound = 0;
    const totalPairs = 8;
    let isProcessing = false; // Prevents spamming clicks during animations

    // --- DOM Elements ---
    const deckSlot = document.getElementById('deck-slot');
    const drawnCardSlot = document.getElementById('drawn-card-slot');
    const gridSlots = document.querySelectorAll('.grid-slot');
    const victoryScreen = document.getElementById('victory-screen');
    const soundCorrect = document.getElementById('snd-correct');
    const soundWrong = document.getElementById('snd-wrong');

    // --- Initialization ---
    function initGame() {
        // Reset game state
        matchesFound = 0;
        currentCardId = null;
        isProcessing = false;
        
        // Reset UI
        victoryScreen.classList.add('hidden');
        drawnCardSlot.innerHTML = '';
        drawnCardSlot.classList.add('empty');
        deckSlot.classList.remove('disabled');
        deckSlot.innerHTML = '<img src="assets/images/card-back.png" alt="Deck">';
        
        // Remove all matched classes from grid slots
        gridSlots.forEach(slot => {
            slot.classList.remove('matched');
        });
        
        // 1. Create deck array [1, 2, 3, 4, 5, 6, 7, 8]
        deck = Array.from({length: totalPairs}, (_, i) => i + 1);
        
        // 2. Shuffle the deck (Fisher-Yates algorithm)
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        console.log("Deck shuffled:", deck); // Debugging aid
    }

    // --- Game Logic Functions ---

    function drawCard() {
        // Cannot draw if: Processing a match, deck empty, or card already drawn
        if (isProcessing || deck.length === 0 || currentCardId !== null) return;

        currentCardId = deck.pop();

        // Update UI
        drawnCardSlot.innerHTML = `<img src="assets/images/${currentCardId}.jpg" alt="Card ${currentCardId}">`;
        drawnCardSlot.classList.remove('empty');

        if (deck.length === 0) {
            deckSlot.classList.add('disabled');
            deckSlot.innerHTML = ""; // Hide card back when empty
        }
    }

    function handleGridClick(slot) {
        // Ignore click if: No card drawn, processing another move, or slot already matched
        if (currentCardId === null || isProcessing || slot.classList.contains('matched')) {
            return;
        }

        const targetId = parseInt(slot.getAttribute('data-id'));

        if (targetId === currentCardId) {
            handleCorrectMatch(slot);
        } else {
            handleWrongMatch();
        }
    }

    function handleCorrectMatch(slot) {
        isProcessing = true;
        soundCorrect.currentTime = 0;
        soundCorrect.play().catch(e => console.log("Audio play failed:", e));

        // 1. Mark the slot as matched (this will add green border via CSS)
        slot.classList.add('matched');

        // 2. Clear the drawn card slot
        drawnCardSlot.innerHTML = '';
        drawnCardSlot.classList.add('empty');
        currentCardId = null;
        matchesFound++;

        // 3. Check Win Condition
        if (matchesFound === totalPairs) {
            setTimeout(() => {
                victoryScreen.classList.remove('hidden');
                isProcessing = false;
            }, 500);
        } else {
            // 4. Automatically draw the next card if deck is not empty
            setTimeout(() => {
                isProcessing = false;
                if (deck.length > 0) {
                    drawCard();
                }
            }, 500);
        }
    }

    function handleWrongMatch() {
        isProcessing = true;
        soundWrong.currentTime = 0;
        soundWrong.play().catch(e => console.log("Audio play failed:", e));

        // Add shake class to the drawn card area
        drawnCardSlot.classList.add('shake');

        // Remove shake class after animation finishes so it can be triggered again
        setTimeout(() => {
            drawnCardSlot.classList.remove('shake');
            isProcessing = false;
        }, 500);
    }


    // --- Event Listeners ---
    deckSlot.addEventListener('click', drawCard);

    gridSlots.forEach(slot => {
        slot.addEventListener('click', () => handleGridClick(slot));
    });


    // Start the game on load
    initGame();
});