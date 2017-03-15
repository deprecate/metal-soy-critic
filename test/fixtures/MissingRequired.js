import Component from 'metal-component';
import Soy from 'metal-soy';

import 'OtherComponent';
import templates from './Test.soy';
import {Config} from 'metal-state';

class Test extends Component {
}

Test.STATE = {
  description: Config.string().required(),
  name: Config.string().required(),
  other: Config.string(),
  title: Config.string()
};

Soy.register(Test, templates);

export default Test;
