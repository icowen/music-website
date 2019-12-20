import React from 'react';
import {shallow} from 'enzyme';
import App from './App';
import HomePage from "./HomePage";
import * as tf from '@tensorflow/tfjs';


jest.mock('@tensorflow/tfjs');
tf.loadLayersModel.mockResolvedValue('Fake Model');


describe('My App', function () {
    const component = shallow(<App />);
    it('should render the HomePage', function () {
        expect(component.find(HomePage).props().model).toEqual('Fake Model');
    });
});
