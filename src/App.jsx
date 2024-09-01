import React, { useRef  } from 'react';
import './styles.css';


export default function App() {
    const inputRef = useRef(null);
    const solution = 'Erfahrung'
    const solution_text = 'Die Lösung war: '
    let counter = 0;


    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitAnswer();
        }
    };


    const submitAnswer = () => {
        const inputElement = inputRef.current;
        const inputValue = inputElement.innerText.trim();

        if (inputValue) {
            if (inputValue === solution){
                wordGuessed()
            } else {
                const heartImages = document.querySelectorAll('.hearts img');
                if (heartImages.length > 0) {
                    heartImages[counter].classList.add('disappear');
                    counter ++
                    if (counter === 3){
                        gameOver();
                    }
                }
            }
        }
    };

    const wordGuessed = () => {
        const correct_screen = document.getElementById('third-sect');
        correct_screen.classList.remove('disappear');
        const cor_word = document.getElementById('cor-word');
        cor_word.innerText = solution_text + solution;
        //newExercise();
        const countdown_element = document.getElementById('countdown');
        let countdown = 3
        const intervalId = setInterval(() => {
            countdown_element.innerText = countdown;
            countdown--;

            if (countdown < 0) {
                clearInterval(intervalId);
                correct_screen.classList.add('disappear');
                cor_word.innerText = '';
                countdown_element.innerText = '4';
            }
        }, 1000);
    }

    const gameOver = () => {
        const inputElement = document.getElementById('translation-input');
        inputElement.contentEditable = "false";
        const main_section = document.querySelector('#main-sect');
        main_section.classList.add('disappear')
        const sec_section = document.querySelector('#second-sect');
        sec_section.classList.remove('disappear');
        const fieldText = document.querySelector('#translation-input');
        fieldText.innerHTML = ('');
        const correct_screen = document.getElementById('third-sect');
        correct_screen.classList.add('disappear');
        const heartImages = document.querySelectorAll('.hearts img');
        heartImages.forEach((image) => {
            image.classList.add('disappear');
        });
    };

    const restartGame = () => {
        const main_section = document.querySelector('#main-sect');
        main_section.classList.remove('disappear')
        const sec_section = document.querySelector('#second-sect');
        sec_section.classList.add('disappear');
        counter = 0
        const fieldText = document.querySelector('#translation-input');
        fieldText.innerHTML = ('');
        fieldText.contentEditable = "true";
        const heartImages = document.querySelectorAll('.hearts img');
        heartImages.forEach((image) => {
            image.classList.remove('disappear');
        });
    };



    return (
        <>
            <div className="logo">
                <img src="../img/logos/logo-no-background.png" alt="logo"/>
            </div>
            <div className="no-hearts">
                <img src="../img/minecraft_no_heart.png" alt="Health"/>
                <img src="../img/minecraft_no_heart.png" alt="Health"/>
                <img src="../img/minecraft_no_heart.png" alt="Health"/>
            </div>
            <div className="hearts">
                <img src="/img/minecraft_heart.png" alt="Health"/>
                <img src="../img/minecraft_heart.png" alt="Health"/>
                <img src="../img/minecraft_heart.png" alt="Health"/>
            </div>
            <div id="score">
                Score: / Highscore
            </div>
            <section id="main-sect">
                <div className="text">
                    <p id="en-text">
                        Working for Andeo is a great experience
                    </p>
                    <p id="de-text">
                        Für Andeo zu arbeiten ist eine grossartige
                        <span
                            id="translation-input"
                            role="textbox"
                            contentEditable
                            onKeyDown={handleKeyDown}
                            ref={inputRef}
                        >
                        </span>
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
