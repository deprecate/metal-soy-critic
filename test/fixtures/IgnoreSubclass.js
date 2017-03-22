import Component from 'metal-component';
import Soy from 'metal-soy';

import OtherComponent from 'OtherComponent';
import templates from './MissingParams.soy';
import {Config} from 'metal-state';

class Test extends OtherComponent {
}

Test.STATE = {
  name: Config.string().required(),
  title: Config.string().required()
};

Soy.register(Test, templates);

export default Test;
