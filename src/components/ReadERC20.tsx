// src/components/ReadERC20.tsx
import React, { useEffect, useState } from 'react'
import { Text } from '@chakra-ui/react'
import { ERC20ABI as abi } from 'abi/ERC20ABI'
import { BigNumber, ethers } from 'ethers'
import { Contract } from "ethers"
import {Button, NumberInput,  NumberInputField,  FormControl,  FormLabel } from '@chakra-ui/react'

interface Props {
  addressContract: string,
  addressTestContract: string,
  currentAccount: string | undefined
}

declare let window: any

export default function ReadERC20(props: Props) {
  const addressContract = props.addressContract
  const addressTestContract = props.addressTestContract
  const currentAccount = props.currentAccount
  const [symbol, setSymbol] = useState<string>("")
  const [decimals, setDecimals] = useState<number>(-1);
  const [balance, SetBalance] = useState<number | undefined>(undefined)
  const [currentAllowance, SetCurrentAllowance] = useState<number | undefined>(undefined) //Amount of USDC allowance of test contract
  const [amount,setAmount]=useState<string>('100')  //Amount of USDC allowance to set

  useEffect(() => {
    if (!window.ethereum) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20: Contract = new ethers.Contract(addressContract, abi, provider);

    provider.getCode(addressContract).then((result: string) => {
      //check whether it is a contract
      if (result === '0x') return

      erc20.symbol().then((result: string) => {
        setSymbol(result)
      }).catch((e: Error) => console.log(e))

      erc20.decimals().then((result: string) => {
        console.log('decimals returned: ', result);
        setDecimals(parseInt(result));
      })

    })
    //called only once
  }, [])

  //call when currentAccount change
  useEffect(() => {
    if (!window.ethereum) return
    if (!currentAccount) return

    queryTokenBalance(window)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20: Contract = new ethers.Contract(addressContract, abi, provider)

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const fromMe = erc20.filters.Transfer(currentAccount, null)
    erc20.on(fromMe, (from, to, amount, event) => {
      console.log('Transfer|sent', { from, to, amount, event })
      queryTokenBalance(window)
    })

    const toMe = erc20.filters.Transfer(null, currentAccount)
    erc20.on(toMe, (from, to, amount, event) => {
      console.log('Transfer|received', { from, to, amount, event })
      queryTokenBalance(window)
    })

    // remove listener when the component is unmounted
    return () => {
      erc20.removeAllListeners(toMe)
      erc20.removeAllListeners(fromMe)
    }
  }, [currentAccount])

  async function queryTokenBalance(window: any) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20: Contract = new ethers.Contract(addressContract, abi, provider);

    //Get USDC balance of current account
    erc20.balanceOf(currentAccount)
      .then((result: string) => {
        console.log(result);
        SetBalance(BigNumber.from(result).div(BigNumber.from(10).pow(decimals)).toNumber());
      }).catch((e: Error) => console.log(e))


      //Get allowance of test contract
      const allowance = ethers.utils.formatUnits(
        await erc20.allowance(currentAccount, addressTestContract), 
        await erc20.decimals());
        SetCurrentAllowance(allowance);
  }

  async function setAllowance(event:React.FormEvent) {
    event.preventDefault()
    if(!window.ethereum) return    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const erc20:Contract = new ethers.Contract(addressContract, abi, signer)
    const decimals = await erc20.decimals();
    await erc20.approve(addressTestContract, ethers.utils.parseUnits(amount, decimals));
  }

  const handleChange = (value:string) => setAmount(value)

  return (
    <div>
      <Text><b>ERC20 Contract</b>: {addressContract}</Text>
      <Text><b>Test Contract</b>: {addressTestContract}</Text>
      <Text my={4}><b>USDC balance in current account</b>: {balance} {symbol}</Text>
      <Text my={4}><b>USDC allowance in current account</b>: {currentAllowance} </Text>
      <form onSubmit={setAllowance}>
        <FormControl>
          <FormLabel htmlFor='amount'>Amount: </FormLabel>
          <NumberInput defaultValue={amount} min={10} max={1000} onChange={handleChange}>
            <NumberInputField />
          </NumberInput>
          <Button type="submit" isDisabled={!currentAccount}>Set Allowance</Button>
        </FormControl>
      </form>
    </div>
  )
}
