// @flow
import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import Dialog from 'react-toolbox/lib/dialog/Dialog';
import { defineMessages, intlShape } from 'react-intl';
import WalletRecoveryPhraseMnemonic from './WalletRecoveryPhraseMnemonic';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import WalletRecoveryInstructions from './WalletRecoveryInstructions';
import styles from './WalletRecoveryPhraseDisplayDialog.scss';

const messages = defineMessages({
  recoveryPhrase: {
    id: 'wallet.backup.recovery.phrase.dialog.title',
    defaultMessage: '!!!Recovery phrase',
    description: 'Title for the "Recovery Phrase" dialog.'
  },
  backupInstructions: {
    id: 'wallet.backup.recovery.phrase.display.dialog.backup.instructions',
    defaultMessage: `!!!Please, make sure you have carefully written down your recovery phrase somewhere safe. 
    You will need this phrase later for next use and recover. Phrase is case sensitive.`,
    description: 'Instructions for backing up wallet recovery phrase on dialog that displays wallet recovery phrase.'
  },
  termDevice: {
    id: 'wallet.backup.recovery.phrase.display.dialog.terms.and.condition.device',
    defaultMessage: `!!!I understand that my money are held securely on this device only, not on the company servers`,
    description: 'Term and condition on wallet backup dialog describing that wallet is on a users device, not on company servers'
  },
  buttonLabelIHaveWrittenItDown: {
    id: 'wallet.backup.recovery.phrase.display.dialog.button.label.iHaveWrittenItDown',
    defaultMessage: '!!!Yes, I’ve written it down',
    description: 'Label for button "Yes, I’ve written it down" on wallet backup dialog'
  }
});

@observer
export default class WalletRecoveryPhraseDisplayDialog extends Component {

  static propTypes = {
    recoveryPhrase: PropTypes.string.isRequired,
    onStartWalletBackup: PropTypes.func.isRequired,
    onCancelBackup: PropTypes.func.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      recoveryPhrase,
      onStartWalletBackup,
      onCancelBackup,
    } = this.props;

    const actions = [
      {
        label: intl.formatMessage(messages.buttonLabelIHaveWrittenItDown),
        onClick: onStartWalletBackup,
        primary: true
      }
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.recoveryPhrase)}
        actions={actions}
        active
        style={styles.component}
      >
        <WalletRecoveryInstructions
          instructionsText={intl.formatMessage(messages.backupInstructions)}
        />
        <WalletRecoveryPhraseMnemonic phrase={recoveryPhrase} />
        <DialogCloseButton onClose={onCancelBackup} />
      </Dialog>
    );
  }

}
