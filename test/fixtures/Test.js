import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './Test.soy';
import {Config} from '../../util/imports';

class Test extends Component {
}

Test.STATE = {
  name: Config.string().required(),
  title: Config.string().required(),
  optionalInfo: Config.string()
};

Soy.register(Test, templates);

export default Test;
