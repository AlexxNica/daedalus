// @flow
import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import QRCode from 'qrcode.react';
import styles from './WalletReceive.scss';
import iconUrl from '../../assets/images/clipboard-ic.svg';

const messages = defineMessages({
  walletReceivePageTitle: {
    id: 'wallet.receive.page.title',
    defaultMessage: '!!!Title - Your shopping wallet address',
    description: 'Title for the wallet "Receive page"'
  },
  walletReceiveInstructions: {
    id: 'wallet.receive.page.instructions',
    defaultMessage: '!!!Wallet receive instructions',
    description: 'Instructions for sharing wallet address to receive payments on the wallet "Receive Page"'
  }
});

@observer
export default class WalletReceive extends Component {

  static propTypes = {
    walletName: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
    onCopyAddress: PropTypes.func.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { walletName, walletAddress, onCopyAddress } = this.props;
    const { intl } = this.context;
    return (
      <div className={styles.component}>

        <div className={styles.centeredBox}>

          <div className={styles.heading}>
            <FormattedHTMLMessage
              {...messages.walletReceivePageTitle}
              values={{ walletName }}
            />
          </div>

          <div className={styles.qrCode}>
            <QRCode
              value={walletAddress}
              bgColor="transparent"
              size={240}
            />
          </div>

          <div className={styles.hash}>
            {walletAddress}
            <CopyToClipboard text={walletAddress} onCopy={onCopyAddress.bind(this, walletAddress)}>
              <img className={styles.icon} src={iconUrl} role="presentation" />
            </CopyToClipboard>
          </div>

          <div className={styles.instructions}>
            {intl.formatMessage(messages.walletReceiveInstructions)}
          </div>

        </div>

      </div>
    );
  }

}
