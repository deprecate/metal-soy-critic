import Component from 'metal-component';
import Soy from 'metal-soy';

import 'othercomponent';
import templates from './CaseImport.soy';
import {Config} from 'metal-state';

class CaseImport extends Component {
}

Test.STATE = {};

Soy.register(Test, templates);

export default Test;
