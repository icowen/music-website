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
            untrainedPrediction: [],
            untrainedPitches: [],
            trainedPitches: [],
            component: null,
            loadingNotes: null
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.predict = this.predict.bind(this);
        this.getNoteAsArr = this.getNoteAsArr.bind(this);
    }


    playSongTrained = () => {
        this.midiSounds.cancelQueue();
        const start = this.midiSounds.contextTime();
        for (let i = 0; i < this.state.trainedPitches.length; i++) {
            this.midiSounds.playChordAt(i + start, 3, [this.state.trainedPitches[i]], 1);
        }
    };
    playSongUntrained = () => {
        this.midiSounds.cancelQueue();
        const start = this.midiSounds.contextTime();
        for (let j = 0; j < this.state.untrainedPitches.length; j++) {
            this.midiSounds.playChordAt(j + start, 3, [this.state.untrainedPitches[j]], 1);
        }
    };

    stop = () => {
        this.midiSounds.cancelQueue();
    };

    onSubmit = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            prediction: [prevState.note1, prevState.note2],
            untrainedPrediction: [prevState.note1, prevState.note2],
            notesAsArr: null,
            untrainedPitches: [],
            trainedPitches: [],
        }));
        this.getNoteAsArr();
    };

    async predict() {
        await this.predictWithModel(this.props.model, "trained");
        await this.predictWithModel(this.props.untrainedModel, "untrained");
        this.setState({
            component: <p>
                <button onClick={this.playSongUntrained.bind(this)}>Play Untrained</button>
                <button onClick={this.playSongTrained.bind(this)}>Play Trained</button>
                <button onClick={this.stop.bind(this)}>Stop</button>
            </p>
        });
        return true;
    };

    async predictWithModel(model, name) {
        let prevNote1 = this.state.prediction.slice(-2, -1);
        let prevNote2 = this.state.prediction.slice(-1);
        let pred = [prevNote1, prevNote2];
        let pitches = [];
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
            prevNote1 = pred.slice(-2, -1);
            prevNote2 = pred.slice(-1);
            prevNote1 = notesLettersAsKeys[prevNote1[0]];
            prevNote2 = notesLettersAsKeys[prevNote2[0]];
            const prevNoteArr1 = new Array(128).fill(0);
            const prevNoteArr2 = new Array(128).fill(0);
            prevNoteArr1[prevNote1] = 1;
            prevNoteArr2[prevNote2] = 1;
            let predInput = [...prevNoteArr1, ...prevNoteArr2];
            let prediction = await model.predict(tf.tensor2d(predInput, [1, 256])).array();
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
                    pitches = [...pitches, i];
                    break;
                }
            }
            pred = [...pred, predNote];
        }
        this.setState({[name + "Pitches"]: pitches});
        this.setState({[name + "Predictions"]: pred});
    }

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
                component: <Loading/>
            });
            return this.predict();
        } catch (e) {
            this.setState({notesAsArr: null, error: e.message})
        }
        return false
    };

    onChange = (event) => {
        const name = event.target.name;
        const notes = event.target.value;
        this.setState({[name]: notes})
    };

    convertNumberToLetter = (x) => {
        const note = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const octave = [];
        for (let i = -1; i < 11; i++) {
            octave.push(i.toString())
        }
        let notesNumsAsKeys = {};
        for (let i = 0; i < 129; i++) {
            notesNumsAsKeys[i] = note[i % 12] + octave[Math.floor(i / 12)];
        }
        return notesNumsAsKeys[x]
    };

    render() {
        return (
            <div className={'main-content'}>
                <h1 className={'title'}>
                    {'Generate Music Using a Neural Net'}
                </h1>
                <Instructions/>
                <div>
                    <form onSubmit={this.onSubmit}>
                        <label>
                            Enter first note (A4, B#9, C-1, etc.):
                            <input className={'input-box note-one'}
                                   name={'note1'}
                                   type={'text'}
                                   placeholder={'C4'}
                                   onChange={this.onChange}/>
                        </label>
                        <br/>
                        <label>
                            Enter second note (A4, B#9, C-1, etc.):
                            <input className={'input-box note-two'}
                                   name={'note2'}
                                   type={'text'}
                                   placeholder={'C4'}
                                   onChange={this.onChange}/>
                        </label>
                        <br/>
                        <input type="submit" value="Make Music!"/>
                    </form>
                    <div className={'error'}>{this.state.error}</div>
                    <div className={'output'}>{this.state.component}</div>
                    <div>{this.state.loadingNotes}</div>
                    <p>{"Untrained"}</p>
                    <div className={'pitches'}>
                        {this.state.untrainedPitches.map(x => <div id={x} className={'note'}>{`${x}=(${this.convertNumberToLetter(x)})`}</div>)}</div>
                    <p>{"Trained"}</p>
                    <div className={'pitches'}>
                        {this.state.trainedPitches.map(x => <div id={x} className={'note'}>{`${x}=(${this.convertNumberToLetter(x)})`}</div>)}</div>
                    <MIDISounds className={'midi'}
                                ref={(ref) => (this.midiSounds = ref)}
                                appElementName="root"
                                instruments={[3]}/>
                </div>
            </div>
        )
    }
}

export default HomePage;