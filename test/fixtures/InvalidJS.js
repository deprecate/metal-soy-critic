import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './Test.soy';
import {Config} from 'metal-state';

class Test extendz Component {
}

Test.STATE = {
  name: Config.string().required(),
};

Soy.register(Test, templates);

export default Test;
