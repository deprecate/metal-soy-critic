import Component from 'metal-component';
import Soy from 'metal-soy';

import 'OtherComponent';
import templates from './Test.soy';
import {Config} from 'metal-state';

class Test extends Component {
  _handleOtherClick() {}
}

Test.STATE = {};

Soy.register(Test, templates);

export default Test;
