// @flow
import { observable, computed } from 'mobx';
import Store from './lib/Store';
import { matchRoute } from '../lib/routing-helpers';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';

export default class WalletsStore extends Store {

  BASE_ROUTE = '/wallets';

  @observable walletsRequest = new CachedRequest(this.api, 'getWallets');
  @observable createWalletRequest = new Request(this.api, 'createWallet');
  @observable sendMoneyRequest = new Request(this.api, 'createTransaction');

  constructor(...args) {
    super(...args);
    this.actions.createPersonalWallet.listen(this._createPersonalWallet);
    this.actions.sendMoney.listen(this._sendMoney);
  }

  _createPersonalWallet = async (params) => {
    const wallet = await this.createWalletRequest.execute(params);
    await this.walletsRequest.patch(result => { result.push(wallet); });
    this.actions.toggleCreateWalletDialog();
    this.actions.goToRoute({ route: this.getWalletRoute(wallet.id) });
  };

  _sendMoney = async (transactionDetails) => {
    const wallet = this.active;
    await this.sendMoneyRequest.execute({
      ...transactionDetails,
      walletId: wallet.id,
      amount: parseFloat(transactionDetails.amount),
      sender: wallet.address,
      currency: wallet.currency,
    });
    this.walletsRequest.invalidate({ immediately: true });
    this.stores.transactions.searchRequest.invalidate({ immediately: true });
    this.actions.goToRoute({ route: this.getWalletRoute(wallet.id) });
  };

  @computed get all() {
    return this.walletsRequest.execute(this.stores.user.active.id).result || [];
  }

  @computed get active() {
    const currentRoute = this.stores.router.location.pathname;
    const match = matchRoute(`${this.BASE_ROUTE}/:id(*page)`, currentRoute);
    if (match) return this.all.find(w => w.id === match.id) || null;
    return null;
  }

  // A unique token for each wallet switch (necessary for re-mounting parts of the DOM)
  @computed get activeWalletToken() {
    const id = this.active ? this.active.id : 'none';
    return `${this.active.id}-${Date.now()}`;
  }

  getWalletRoute(walletId: ?string, screen = 'home') {
    return `${this.BASE_ROUTE}/${walletId}/${screen}`;
  }

  isValidAddress(address: string) {
    return this.api.isValidAddress('ADA', address);
  }

}
