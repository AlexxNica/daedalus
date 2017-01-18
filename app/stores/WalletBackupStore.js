// @flow
import { observable, action, computed } from 'mobx';
import Request from './lib/Request';
import Store from './lib/Store';

export type walletBackupSteps = 'privacyWarning' | 'recoveryPhraseDisplay' | 'recoveryPhraseEntry' | void;

export default class WalletBackupStore extends Store {

  @observable setWalletBackupCompleted = new Request(this.api, 'setWalletBackupCompleted');
  @observable inProgress = false;
  @observable currentStep: walletBackupSteps = null;
  @observable walletId = '';
  @observable recoveryPhrase = [];
  @observable recoveryPhraseShuffled = [];
  @observable completed = false;
  @observable enteredPhrase = [];
  @observable isPrivacyNoticeAccepted = false;
  @observable isEntering = false;
  @observable isTermDeviceAccepted = false;
  @observable isTermRecoveryAccepted = false;
  @observable countdownRemaining = 0;
  @observable countdownTimer = null;

  constructor(...args) {
    super(...args);
    this.actions.initiateWalletBackup.listen(this._initiateWalletBackup);
    this.actions.acceptPrivacyNoticeForWalletBackup.listen(this._acceptPrivacyNoticeForWalletBackup);
    this.actions.continueToRecoveryPhraseForWalletBackup.listen(this._continueToRecoveryPhraseForWalletBackup);
    this.actions.startWalletBackup.listen(this._startWalletBackup);
    this.actions.addWordToWalletBackupVerification.listen(this._addWordToWalletBackupVerification);
    this.actions.clearEnteredRecoveryPhrase.listen(this._clearEnteredRecoveryPhrase);
    this.actions.acceptWalletBackupTermDevice.listen(this._acceptWalletBackupTermDevice);
    this.actions.acceptWalletBackupTermRecovery.listen(this._acceptWalletBackupTermRecovery);
    this.actions.restartWalletBackup.listen(this._restartWalletBackup);
    this.actions.cancelWalletBackup.listen(this._cancelWalletBackup);
    this.actions.finishWalletBackup.listen(this._finishWalletBackup);
  }

  @action _initiateWalletBackup = (params) => {
    this.actions.toggleCreateWalletDialog();
    const { walletId, recoveryPhrase } = params;
    this.inProgress = true;
    this.currentStep = 'privacyWarning';
    this.walletId = walletId;
    this.recoveryPhrase = recoveryPhrase.map(word => ({ word }));
    this.recoveryPhraseShuffled = recoveryPhrase
      .sort(() => 0.5 - Math.random())
      .map(w => ({ word: w, isActive: true }));
    this.completed = false;
    this.enteredPhrase = [];
    this.isPrivacyNoticeAccepted = false;
    this.isEntering = false;
    this.isTermDeviceAccepted = false;
    this.isTermRecoveryAccepted = false;
    this.countdownRemaining = 10;
    this.countdownTimer = null;
    this.countdownTimer = setInterval(() => {
      if (this.countdownRemaining > 0) {
        action(() => this.countdownRemaining--)();
      } else {
        clearInterval(this.countdownTimer);
      }
    }, 1000);
  };

  @action _acceptPrivacyNoticeForWalletBackup = () => {
    this.isPrivacyNoticeAccepted = true;
  };

  @action _continueToRecoveryPhraseForWalletBackup = () => {
    this.currentStep = 'recoveryPhraseDisplay';
  };

  @action _startWalletBackup = () => {
    this.currentStep = 'recoveryPhraseEntry';
  };

  @action _addWordToWalletBackupVerification = (params) => {
    const { word } = params;
    this.enteredPhrase.push({ word });
    const pickedWord = this.recoveryPhraseShuffled.find(w => w.word === word);
    pickedWord.isActive = false;
  };

  @action _clearEnteredRecoveryPhrase = () => {
    this.enteredPhrase = [];
    this.recoveryPhraseShuffled = this.recoveryPhraseShuffled.map(
      ({ word }) => ({ word, isActive: true })
    );
  };

  @computed get isRecoveryPhraseValid() {
    return this.recoveryPhrase.reduce((words, { word }) => words + word, '') ===
    this.enteredPhrase.reduce((words, { word }) => words + word, '');
  }

  @action _acceptWalletBackupTermDevice = () => {
    this.isTermDeviceAccepted = true;
  };

  @action _acceptWalletBackupTermRecovery = () => {
    this.isTermRecoveryAccepted = true;
  };

  @action _restartWalletBackup = () => {
    this._clearEnteredRecoveryPhrase();
    this.currentStep = 'recoveryPhraseDisplay';
  };

  @action _cancelWalletBackup = () => {
    this.inProgress = false;
    this.actions.goToRoute({ route: this.stores.wallets.getWalletRoute(this.walletId) });
  };

  @action _finishWalletBackup = async () => {
    this.inProgress = false;
    this.setWalletBackupCompleted.execute(this.walletId);
    this.actions.goToRoute({ route: this.stores.wallets.getWalletRoute(this.walletId) });
  }

}
