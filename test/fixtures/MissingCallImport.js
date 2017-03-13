import Component from 'metal-component';
import Soy from 'metal-soy';

import 'MyCoolComponent';
import templates from './Test.soy';
import {Config} from 'metal-state';

class Test extends Component {
}

Test.STATE = {
  name: Config.string().required(),
  title: Config.string().required(),
  optionalInfo: Config.string()
};

Soy.register(Test, templates);

export default Test;
