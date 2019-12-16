import React from 'react';
import {shallow} from 'enzyme';
import App from './App';
import HomePage from "./HomePage";


describe('My App', function () {
    const component = shallow(<App />);
    it('should render the HomePage', function () {
        expect(component.find(HomePage).length).toEqual(1);
    });
});
