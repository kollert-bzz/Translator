import React, { useRef, useEffect, useState } from 'react';
import './styles.css';

export default function App() {
    const inputRef = useRef(null);
    const [currentSentence, setCurrentSentence] = useState({});
    const [sentences, setSentences] = useState([]);
    const [counter, setCounter] = useState(0);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    let hasDot = false;

    useEffect(() => {
        fetch('./sentences.json')
            .then(response => response.json())
            .then(data => setSentences(data.sentences || []))
            .catch(error => console.error('Error fetching sentences:', error));

        const storedHighScore = getLocalStorageItem('highscore');
        setHighScore(storedHighScore || 0);
    }, []);

    useEffect(() => {
        if (sentences.length > 0) {
            fetchRandomSentence();
        }
    }, [sentences]);

    useEffect(() => {
        const inputElement = document.querySelector('#translation-input');
        if (inputElement) {
            inputElement.focus();
        }
    }, [currentSentence]);

    const fetchRandomSentence = () => {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        let sentence = sentences[randomIndex];
        const germanWords = sentence.german.split(' ');
        const randomWordIndex = Math.floor(Math.random() * germanWords.length);
        let missingWord = germanWords[randomWordIndex];

        if (missingWord.endsWith('.')) {
            hasDot = true;
            missingWord = missingWord.slice(0, -1);
        }

        germanWords[randomWordIndex] = '<span id="translation-input" role="textbox" contentEditable></span>';

        setCurrentSentence({
            ...sentence,
            missingWord,
            germanWords,
            randomWordIndex,
            hasDot
        });
    };


    const isSkipButtonVisible = () => {
        const skipButton = document.getElementById('skip_button');
        return skipButton && !skipButton.classList.contains('disappear');
    };

    const isRestartButtonVisible = () => {
        const restartButton = document.getElementById('second-sect');
        return restartButton && !restartButton.classList.contains('disappear');
    };

    document.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            if (isRestartButtonVisible()){
                document.getElementById('restartButton').click();
            } else if (isSkipButtonVisible()){
                document.getElementById('skipButton').click();
            }
        }
    });

    const handleKeyDown = (event) => {
        if (isSkipButtonVisible()) {
            event.preventDefault();
            skipScreen();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            submitAnswer();
        }
    };

    const submitAnswer = () => {
        const inputElement = inputRef.current;
        const inputValue = inputElement.innerText.trim();

        if (inputValue === '') {
            document.getElementById('translation-input').innerText = '';
        } else if (inputValue === currentSentence.missingWord) {
            wordGuessed();
            document.getElementById('translation-input').innerText = '';
        } else {
            const heartImages = document.querySelectorAll('.hearts img');
            if (heartImages.length > 0) {
                heartImages[counter].classList.add('disappear');
                setCounter(prevCounter => prevCounter + 1);
                if (counter + 1 === 3) {
                    gameOver();
                }
            }
        }

        if (inputElement) {
            inputElement.blur();
            inputElement.focus();
        }
    };

    const wordGuessed = () => {
        setScore(prevScore => {
            const newScore = prevScore + 1;
            if (newScore > highScore) {
                setHighScore(newScore);
                setLocalStorageItem('highscore', newScore);
            }
            return newScore;
        });

        const skip = document.getElementById('skip_button');
        skip.classList.remove('disappear');

        const updatedGermanWords = currentSentence.germanWords.map((word, index) =>
            index === currentSentence.randomWordIndex ? '<span id="translation-input" role="textbox" contentEditable></span>' : word
        );

        setCurrentSentence({
            ...currentSentence,
            germanWords: updatedGermanWords,
            missingWord: null
        });

        const correctScreen = document.getElementById('third-sect');
        correctScreen.classList.remove('disappear');
        const corWord = document.getElementById('cor-word');
        corWord.innerText = `The solution was: ${currentSentence.missingWord}`;
        const countdownElement = document.getElementById('cor_countdown');
        let countdown = 3;
        const intervalId = setInterval(() => {
            countdownElement.innerText = countdown;
            countdown--;
            if (countdown < 0) {
                clearInterval(intervalId);
                correctScreen.classList.add('disappear');
                corWord.innerText = '';
                countdownElement.innerText = '4';
                fetchRandomSentence();
                skip.classList.add('disappear');
            }
        }, 1000);
        setCountdownInterval(intervalId);
    };



    const skipScreen = () => {
        clearInterval(countdownInterval);
        const corWord = document.getElementById('cor-word');
        corWord.innerText = '';
        document.getElementById('cor_countdown').innerText = '4';
        const correctScreen = document.getElementById('third-sect');
        correctScreen.classList.add('disappear');
        document.getElementById('skip_button').classList.add('disappear');
        fetchRandomSentence();
    };


    const gameOver = () => {
        const inputElement = inputRef.current;
        inputElement.contentEditable = "false";
        document.querySelector('#main-sect').classList.add('disappear');
        document.querySelector('#second-sect').classList.remove('disappear');
        const fieldText = document.querySelector('#translation-input');
        fieldText.innerHTML = '';
        document.getElementById('third-sect').classList.add('disappear');
        const heartImages = document.querySelectorAll('.hearts img');
        heartImages.forEach((image) => {
            image.classList.add('disappear');
        });
        const falseScreen = document.getElementById('fourth-sect');
        falseScreen.classList.remove('disappear');
        const falseWord = document.getElementById('false-word');
        falseWord.innerText = `The solution was: ${currentSentence.missingWord}`;
    };

    const restartGame = () => {
        document.querySelector('#main-sect').classList.remove('disappear');
        document.querySelector('#second-sect').classList.add('disappear');
        document.querySelector('#fourth-sect').classList.add('disappear');
        setCounter(0);
        setScore(0);
        const fieldText = document.querySelector('#translation-input');
        fieldText.innerHTML = '';
        fieldText.contentEditable = "true";
        const heartImages = document.querySelectorAll('.hearts img');
        heartImages.forEach((image) => {
            image.classList.remove('disappear');
        });
        fetchRandomSentence();
    };

    const renderGermanSentence = () => {
        if (!currentSentence.germanWords) return null;
        return (
            <>
                {currentSentence.germanWords.map((word, index) => {
                    if (index === currentSentence.randomWordIndex) {
                        return (
                            <span
                                key={index}
                                id="translation-input"
                                role="textbox"
                                contentEditable
                                ref={inputRef}
                                onKeyDown={handleKeyDown}
                            >
                            </span>
                        );
                    }
                    return <span key={index}>{word} </span>;
                })}
                {currentSentence.hasDot && currentSentence.randomWordIndex === currentSentence.germanWords.length - 1 && (
                    <span>.</span>
                )}
            </>
        );
    };

    const setLocalStorageItem = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getLocalStorageItem = (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    };

    return (
        <>
            <div className="logo">
                <img src="./img/logos/logo-no-background.png" alt="logo"/>
            </div>
            <div className="no-hearts">
                <img src="./img/minecraft_no_heart.png" alt="Health"/>
                <img src="./img/minecraft_no_heart.png" alt="Health"/>
                <img src="./img/minecraft_no_heart.png" alt="Health"/>
            </div>
            <div className="hearts">
                <img src="./img/minecraft_heart.png" alt="Health"/>
                <img src="./img/minecraft_heart.png" alt="Health"/>
                <img src="./img/minecraft_heart.png" alt="Health"/>
            </div>
            <div id="score">
                Score: {score} / Highscore: {highScore}
            </div>
            <section id="main-sect">
                <div className="text">
                    <p id="en-text">{currentSentence.english}</p>
                    <p id="de-text">
                        {renderGermanSentence()}
                    </p>
                </div>
            </section>
            <section id="second-sect" className="disappear">
                <h1>GAME OVER!</h1>
                <button onClick={restartGame} id="restartButton">Play again</button>
            </section>
            <section id="third-sect" className="disappear">
                <h2>CORRECT / KORREKT</h2>
                <p id="cor-word"></p>
                <div id="cor_countdown">4</div>
            </section>
            <section id="fourth-sect" className="disappear">
                <h2>FALSE / FALSCH</h2>
                <p id="false-word"></p>
                <div>Don't give up!</div>
            </section>
            <section id="skip_button" className="disappear">
                <button onClick={skipScreen} id="skipButton">Skip</button>
            </section>
        </>
    );
}
