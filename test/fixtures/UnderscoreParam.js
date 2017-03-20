import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './UnderscoreParam.soy';
import {Config} from 'metal-state';

class UnderscoreParam extends Component {
}

UnderscoreParam.STATE = {
  _name: Config.string().value('foo')
};

Soy.register(UnderscoreParam, templates);

export default UnderscoreParam;
