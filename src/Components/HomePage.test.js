import React from 'react';
import {shallow} from 'enzyme';
import HomePage from "./HomePage";
import Instructions from "./Instructions";
import * as tf from "@tensorflow/tfjs";
import Loading from "./Loading";

// jest.mock('@tensorflow/tfjs');
jest.unmock('@tensorflow/tfjs');
tf.Sequential.predict = jest.fn((x) => {return 'C4'});


describe('HomePage', function () {
    const component = shallow(<HomePage />);
    it('should have a title',  () => {
        expect(component.find('.title').text()).toEqual('Generate Music Using a Neural Net');
    });

    it('should have instructions', function () {
        expect(component.find(Instructions).length).toEqual(1);
    });

    it('should allow input notes', function () {
        component.find('.note-one').props().onChange({target: {name: 'note1', value: 'C4'}});
        component.find('.note-two').props().onChange({target: {name: 'note2', value: 'C4'}});
        component.find('form').props().onSubmit({preventDefault: jest.fn()});
        expect(component.find(<Loading />).length).toEqual(2);
    });
});
