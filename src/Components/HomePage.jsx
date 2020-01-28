import React, {Component} from 'react';
import Instructions from "./Instructions";
import * as tf from '@tensorflow/tfjs';
import MIDISounds from 'midi-sounds-react';
import Loading from "./Loading";
import {Piano, KeyboardShortcuts, MidiNumbers} from 'react-piano';
import 'react-piano/dist/styles.css';
import '../customPianoStyles.css';
import PianoWithRecording from "./PianoWithRecording";


const noteRange = {
    first: MidiNumbers.fromNote('c3'),
    last: MidiNumbers.fromNote('f4'),
};

const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: noteRange.first,
    lastNote: noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

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
            loadingNotes: null,
            recording: {
                mode: 'RECORDING',
                events: [],
                currentTime: 0,
                currentEvents: [],
            }
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
            this.midiSounds.playChordAt((i + start)*.5, 3, [this.state.trainedPitches[i]], .1);
        }
    };
    playSongUntrained = () => {
        this.midiSounds.cancelQueue();
        const start = this.midiSounds.contextTime();
        for (let j = 0; j < this.state.untrainedPitches.length; j++) {
            this.midiSounds.playChordAt((j + start)*.5, 3, [this.state.untrainedPitches[j]], .1);
        }
    };

    stop = () => {
        this.midiSounds.cancelQueue();
    };

    onSubmit = (event) => {
        event.preventDefault();
        if (this.state.recording.events.length >= 2) {
            const note1 = this.state.recording.events.slice(-2, -1).midiNumber;
            const note2 = this.state.recording.events.slice(-1).midiNumber;
            this.setState({
                prediction: [note1, note2],
                untrainedPrediction: [note1, note2],
                notesAsArr: null,
                untrainedPitches: [],
                trainedPitches: []
            });
            this.getNoteAsArr();
        } else {
            this.setState({component: <p>{'You must select 2 notes before playing!'}</p>})
        }
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
                    if (i < 24) {
                        predNote = notesNumsAsKeys[i + 24];
                        pitches = [...pitches, i + 24];
                    } else if (i > 108) {
                        predNote = notesNumsAsKeys[i - 24];
                        pitches = [...pitches, i - 24];
                    } else {
                        predNote = notesNumsAsKeys[i];
                        pitches = [...pitches, i];
                    }

                    break;
                }
            }
            pred = [...pred, predNote];
        }
        this.setState({[name + "Pitches"]: pitches});
        this.setState({[name + "Predictions"]: pred});
    }

    getNoteAsArr = () => {
        const ret = [];
        const num1 = this.state.prediction[-2];
        const num2 = this.state.prediction[-1];
        let ret1 = new Array(128).fill(0);
        let ret2 = new Array(128).fill(0);
        ret1[num1] = 1;
        ret2[num2] = 1;
        ret.push(ret1.concat(ret2));
        this.setState({
            notesAsArr: ret,
            error: null,
            component: <Loading/>
        });
        return this.predict();
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

    setRecording = value => {
        this.setState({
            recording: Object.assign({}, this.state.recording, value)
        });
    };

    render() {
        return (
            <div className={'main-content'}>
                <h1 className={'title'}>
                    {'Generate Music Using a Neural Net'}
                </h1>
                <Instructions/>
                <div>
                    <PianoWithRecording noteRange={{first: 48, last: 77}}
                                        width={1024}
                                        playNote={() => {
                                        }}
                                        stopNote={() => {
                                        }}
                                        recording={this.state.recording}
                                        setRecording={this.setRecording}
                                        keyboardShortcuts={keyboardShortcuts}/>
                    <p>{"Selected: "}</p>
                    <div>{this.state.recording.events.map(x =>
                        <div>{this.convertNumberToLetter(x["midiNumber"])}</div>)}</div>
                    <button onClick={this.onSubmit}>{'Create Music'}</button>
                    <div className={'error'}>{this.state.error}</div>
                    <div className={'output'}>{this.state.component}</div>
                    <div>{this.state.loadingNotes}</div>
                    <p>{"Untrained"}</p>
                    <div className={'pitches'}>
                        {this.state.untrainedPitches.map(x => <div id={x}
                                                                   className={'note'}>{`${x}=(${this.convertNumberToLetter(x)})`}</div>)}</div>
                    <p>{"Trained"}</p>
                    <div className={'pitches'}>
                        {this.state.trainedPitches.map(x => <div id={x}
                                                                 className={'note'}>{`${x}=(${this.convertNumberToLetter(x)})`}</div>)}</div>
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