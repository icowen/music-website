import React from 'react';

const Instructions = () => {
    return <div className={'instructions'}>
        {'Enter any two notes you would like. ' +
        'Then listen as a song is generated off these values. ' +
        'Make sure the notes are of the form {note_pitch}{octave_number}, where' +
        'octave number is a value between -1 and 9 and note_pitch is one of the following:\n' +
        'C, C#, D, D#, E, E#, F, F#, G, G#, A, A#, B\n' +
        'For example, Middle C = C4'}
    </div>
};

export default Instructions;