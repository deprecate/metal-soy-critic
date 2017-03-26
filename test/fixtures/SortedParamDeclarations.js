import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './Test.soy';
import {Config} from 'metal-state';

class Test extends Component {
}

Test.STATE = {
  foo: Config.string().required(),
  bar: Config.string().required(),
  baz: Config.string().required(),
  biz: Config.string().required()
};

Soy.register(Test, templates);

export default Test;
