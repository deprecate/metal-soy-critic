import Component from 'metal-component';
import Soy from 'metal-soy';

import 'OtherComponent';
import templates from './Test.soy';

class Test extends Component {
  _handleClick() {
    console.log('foo');
  }
}

Soy.register(Test, templates);

export default Test;
