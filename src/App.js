import Web3 from 'web3';
import Blocpic from './abis/Blocpic.json'

const React = require('react')
const ipfsClient = require('ipfs-http-client');

class App extends React.Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Blocpic.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Blocpic.abi, networkData.address)
      this.setState({ contract })
      const blocpicHash = await contract.methods.get().call()
      this.setState({ blocpicHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor () {
    super()
    this.state = {
      blocpicHash: null,
      contract: null,
      web3: null,
      buffer: null,
      account: null
    }
    this.ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
    this.captureFile = this.captureFile.bind(this)
    this.saveToIpfs = this.saveToIpfs.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
      this.saveToIpfs(event.target.files)
  }

  saveToIpfs (files) {
    let ipfsId
    this.ipfs.add([...files], { progress: (prog) => console.log(`received: ${prog}`) })
      .then((response) => {
        console.log(response)
        ipfsId = response[0].hash
        console.log(ipfsId)
        this.setState({ blocpicHash: ipfsId })
        this.state.contract.methods.set(response[0].hash).send({ from: this.state.account }).then((r) => {
          return this.setState({ blocpicHash: response[0].hash })
        })
      }).catch((err) => {
        console.error(err)
      })
  }

  handleSubmit (event) {
    event.preventDefault()
  }

  render () {
    return (
      <div>
        <a
          href="creablock.io"
          target="_blank"
          rel="noopener noreferrer">
          <img alt='' src={'https://ipfs.infura.io/ipfs/'+ this.state.blocpicHash } />
        </a>
        <form id='captureMedia' onSubmit={this.handleSubmit}>
          <input type='file' onChange={this.captureFile} /><br/>
        </form>
        <div>
          <a target='_blank'
            rel="noopener noreferrer"
            href={'https://ipfs.io/ipfs/' + this.state.blocpicHash}>
            {this.state.blocpicHash}
          </a>
        </div>
      </div>
    )
  }
}
export default App;