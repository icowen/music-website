import React, {Component} from 'react';
import Instructions from "./Instructions";
import * as tf from '@tensorflow/tfjs';
import MIDISounds from 'midi-sounds-react';
import Loading from "./Loading";


class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            note1: null,
            note2: null,
            notesAsArr: null,
            prediction: [],
            pitches: [],
            component: null
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange1 = this.onChange1.bind(this);
        this.onChange2 = this.onChange2.bind(this);
        this.predict = this.predict.bind(this);
        this.getNoteAsArr = this.getNoteAsArr.bind(this);
    }

    playSong = () => {
        for (let i = 0; i < this.state.pitches.length; i++) {
            setTimeout(() => {
                this.midiSounds.playChordNow(3, [this.state.pitches[i]], 1)
            }, i * 1000);
        }
    };

    onSubmit = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            prediction: [prevState.note1, prevState.note2],
            component: <Loading/>
        }));
        this.getNoteAsArr();
    };

    async predict() {
        for (let j = 0; j < 100; j++) {
            const note = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            const octave = [];
            for (let i = -1; i < 11; i++) {
                octave.push(i.toString())
            }
            let notesNumsAsKeys = {};
            for (let i = 0; i < 129; i++) {
                notesNumsAsKeys[i] = note[i % 12] + octave[Math.floor(i / 12)];
            }
            let notesLettersAsKeys = {};
            for (let i = 0; i < 129; i++) {
                notesLettersAsKeys[note[i % 12] + octave[Math.floor(i / 12)]] = i;
            }
            const prevNote1 = this.state.prediction.slice(-2, -1);
            const prevNote2 = this.state.prediction.slice(-1);
            const prevNoteArr1 = new Array(128).fill(0);
            const prevNoteArr2 = new Array(128).fill(0);
            prevNoteArr1[prevNote1] = 1;
            prevNoteArr2[prevNote2] = 1;
            let predInput = [...prevNoteArr1, ...prevNoteArr2];
            let prediction = await this.props.model.predict(tf.tensor2d(predInput, [1, 256])).array();
            prediction = prediction[0];
            let arrSum = prediction.reduce((a, b) => a + b);
            const normPred = prediction.map(x => x / arrSum);
            const rand = Math.random();
            let cutOff = 0;
            let predNote;
            for (let i = 0; i < normPred.length; i++) {
                const note = normPred[i];
                cutOff += note;
                if (rand <= cutOff) {
                    if (i < 21) {
                        predNote = notesNumsAsKeys[i + 24];
                    } else if (i > 108) {
                        predNote = notesNumsAsKeys[i - 24]
                    } else {
                        predNote = notesNumsAsKeys[i];
                    }
                    this.setState(prevState => ({
                        pitches: [...prevState.pitches, i]
                    }));
                    break;
                }
            }
            this.setState(prevState => ({
                prediction: [...prevState.prediction, predNote]
            }));
        }
        return true;
    };

    getNoteAsArr = () => {
        const note = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const octave = [];
        for (let i = -1; i < 11; i++) {
            octave.push(i.toString())
        }

        let notes = {};

        for (let i = 0; i < 129; i++) {
            notes[note[i % 12] + octave[Math.floor(i / 12)]] = i;
        }

        const ret = [];
        const num1 = notes[this.state.note1];
        const num2 = notes[this.state.note2];
        let ret1 = new Array(128).fill(0);
        let ret2 = new Array(128).fill(0);
        try {
            if (!Object.keys(notes).includes(this.state.note1)) throw new Error("Note 1 is not a valid note");
            if (!Object.keys(notes).includes(this.state.note2)) throw new Error("Note 2 is not a valid note");
            ret1[num1] = 1;
            ret2[num2] = 1;
            ret.push(ret1.concat(ret2));
            this.setState({
                notesAsArr: ret,
                error: null,
                component: <p>
                    <button onClick={this.playSong.bind(this)}>Play</button>
                </p>
            });
            return this.predict();
        } catch (e) {
            this.setState({notesAsArr: null, error: e.message})
        }
        return false
    };

    onChange1 = (event) => {
        const notes = event.target.value;
        this.setState({note1: notes})
    };

    onChange2 = (event) => {
        const notes = event.target.value;
        this.setState({note2: notes})
    };

    render() {
        return (
            <div className={'main-content'}>
                <div className={'title'}>
                    {'Generate Music Using a Neural Net'}
                </div>
                <Instructions/>
                <div>
                    <form onSubmit={this.onSubmit}>
                        <input className={'input-box'}
                               type={'text'}
                               placeholder={'Enter first note (A4, B#9, C-1, etc.)...'}
                               onChange={this.onChange1}/>
                    </form>
                    <form onSubmit={this.onSubmit}>
                        <input className={'input-box'}
                               type={'text'}
                               placeholder={'Enter second note (A4, B#9, C-1, etc.)...'}
                               onChange={this.onChange2}/>
                    </form>
                    <div className={'output'}>{this.state.error}</div>
                    <div className={'output'}>{this.state.note1}</div>
                    <div className={'output'}>{this.state.note2}</div>
                    <div className={'output'}>{this.state.component}</div>
                    <MIDISounds ref={(ref) => (this.midiSounds = ref)} appElementName="root" instruments={[3]}/>
                </div>
            </div>
        )
    }
}

export default HomePage;