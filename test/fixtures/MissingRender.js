import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './MissingRender.soy';
import {Config} from 'metal-state';

class MissingRender extends Component {
}

MissingRender.STATE = {
  title: Config.string().required(),
};

Soy.register(MissingRender, templates);

export default Test;
