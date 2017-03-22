import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './Test.soy';
import Config from 'metal-state';

class Test extends Component {
}

Test.STATE = {
  test: Config.string().value('test')
};

Soy.register(Test, templates);

export default Test;
