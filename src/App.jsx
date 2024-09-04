import React, { useRef, useEffect, useState } from 'react';
import './styles.css';

export default function App() {
    const inputRef = useRef(null);
    const [currentSentence, setCurrentSentence] = useState({});
    const [sentences, setSentences] = useState([]);
    const [counter, setCounter] = useState(0);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

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

    const fetchRandomSentence = () => {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[randomIndex];
        const germanWords = sentence.german.split(' ');
        const randomWordIndex = Math.floor(Math.random() * germanWords.length);

        const missingWord = germanWords[randomWordIndex];
        germanWords[randomWordIndex] = '<span id="translation-input" role="textbox" contentEditable></span>';
        setCurrentSentence({
            ...sentence,
            missingWord,
            germanWords,
            randomWordIndex
        });
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
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
    };

    const wordGuessed = () => {
        setScore(prevScore => prevScore + 1);
        if (score + 1 > highScore){
            setLocalStorageItem('highscore', score);
        }
        const element = document.getElementById('score');
        element.innerText = 'Score: ' + (score + 1) + ' / Highscore: ' + (highScore);

        const updatedGermanWords = currentSentence.germanWords.map((word, index) =>
            index === currentSentence.randomWordIndex ? '<span id="translation-input" role="textbox" contentEditable></span>' : word
        );
        const updatedSentence = {
            ...currentSentence,
            germanWords: updatedGermanWords,
            missingWord: null
        };
        setCurrentSentence(updatedSentence);

        const correctScreen = document.getElementById('third-sect');
        correctScreen.classList.remove('disappear');
        const corWord = document.getElementById('cor-word');
        corWord.innerText = `The solution was: ${currentSentence.missingWord}`;

        const countdownElement = document.getElementById('countdown');
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
            }
        }, 1000);
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
        if (score > highScore) {
            setLocalStorageItem('highscore', score);
            setHighScore(score);
        }
    };

    const restartGame = () => {
        document.querySelector('#main-sect').classList.remove('disappear');
        document.querySelector('#second-sect').classList.add('disappear');
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

        return currentSentence.germanWords.map((word, index) => {
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
        });
    };

    const setLocalStorageItem = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getLocalStorageItem = (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    };

    const removeLocalStorageItem = (key) => {
        localStorage.removeItem(key);
    };

    return (
        <>
            <div className="logo">
                <img src="./img/logos/logo-no-background.png" alt="logo" />
            </div>
            <div className="no-hearts">
                <img src="./img/minecraft_no_heart.png" alt="Health" />
                <img src="./img/minecraft_no_heart.png" alt="Health" />
                <img src="./img/minecraft_no_heart.png" alt="Health" />
            </div>
            <div className="hearts">
                <img src="./img/minecraft_heart.png" alt="Health" />
                <img src="./img/minecraft_heart.png" alt="Health" />
                <img src="./img/minecraft_heart.png" alt="Health" />
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
                <button onClick={restartGame}>Play again</button>
            </section>
            <section id="third-sect" className="disappear">
                <h2>CORRECT / KORREKT</h2>
                <p id="cor-word"></p>
                <div id="countdown">4</div>
            </section>
        </>
    );
}
