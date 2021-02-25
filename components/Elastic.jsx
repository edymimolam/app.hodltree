import { useEffect, useState } from "react";
// import { useWeb3 } from "hooks/useWeb3";
// import { utils } from "web3";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { getUnitByDecimal, getMinDecimalValue } from "../utils";
import {
  APPROVE_TEXT,
  TX_PENDING_TEXT,
  TX_SUCCESS_TEXT,
  TOKENS_INPUT_ERROR_TEXT,
  TX_APPROVE_ERROR,
} from "../text";

import {
  Col,
  Card,
  Typography,
  InputNumber,
  Button,
  Divider,
  Modal,
} from "antd";
import { ExportOutlined } from "@ant-design/icons";

//utils
const { fromWei, toWei } = {};

const { Text } = Typography;
dayjs.extend(duration);

export default function Elastic({ instances, initInstances, config }) {
  const {
    emPoolAddress,
    reservePoolAddress,
    inputTokenTicker,
    eptTicker,
    bptTicker,
    eptAddress,
    bptAddress,
    elasticTitle,
    balancerPoolTitle,
  } = config;
  const [exchangeAmount, setExchangeAmount] = useState();
  const [stakeAmount, setStakeAmount] = useState();
  const [withdrawAmount, setWithdrawAmount] = useState();
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [myEPTBalance, setMyEPTBalance] = useState();
  const [myInputTokenBalance, setMyInputTokenBalance] = useState();
  const [eptDecimal, setEptDecimal] = useState();
  const [inputTokenDecimal, setInputTokenDecimal] = useState();
  const [myElasticBPTBalance, setMyElasticBPTBalance] = useState();
  const [elasticInBalance, setElasticInBalance] = useState();
  const [elasticBPTBalance, setElasticBPTBalance] = useState();
  const [isOnHold, setIsOnHold] = useState();
  const [holdTime, setHoldTime] = useState();
  const [reservePoolBalance, setReservePoolBalance] = useState();
  const [modal, setModal] = useState({
    title: "",
    visible: false,
    message: "",
  });

  //useWeb3()
  const { myWallet } = {};

  const closeModal = () =>
    setModal((data) => ({ ...data, visible: false, message: "" }));

  const withdrawInputHandler = (percents) => {
    setWithdrawPercentage(percents);
    if (+percents === 100) {
      setWithdrawAmount(myElasticBPTBalance);
    } else {
      setWithdrawAmount((myElasticBPTBalance / 100) * percents);
    }
  };

  const onStake = async () => {
    if (+stakeAmount <= 0) {
      setModal((data) => ({
        ...data,
        visible: true,
        message: TOKENS_INPUT_ERROR_TEXT,
      }));
      return;
    }
    try {
      const stakeAmountWei = toWei(
        String(stakeAmount),
        getUnitByDecimal(inputTokenDecimal)
      );
      const allowance = await instances.inputToken.methods
        .allowance(myWallet, emPoolAddress)
        .call();

      if (+stakeAmountWei > +allowance) {
        setModal((data) => ({ ...data, visible: true, message: APPROVE_TEXT }));
        const gasForApprove = await instances.inputToken.methods
          .approve(emPoolAddress, stakeAmountWei)
          .estimateGas({ from: myWallet });
        await instances.inputToken.methods
          .approve(emPoolAddress, stakeAmountWei)
          .send({ from: myWallet, gas: gasForApprove });
      }

      const finalAllowance = await instances.inputToken.methods
        .allowance(myWallet, emPoolAddress)
        .call();
      if (+stakeAmountWei <= +finalAllowance) {
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_PENDING_TEXT,
        }));
        const gasForStake = await instances.emPool.methods
          .receiveInToken(stakeAmountWei)
          .estimateGas({ from: myWallet });
        await instances.emPool.methods
          .receiveInToken(stakeAmountWei)
          .send({ from: myWallet, gas: gasForStake });
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_SUCCESS_TEXT,
        }));
        initInstances();
        setStakeAmount(0);
      } else {
        throw new Error(TX_APPROVE_ERROR);
      }
    } catch (err) {
      if (err.message) {
        setModal((data) => ({ ...data, visible: true, message: err.message }));
      } else {
        console.log(err);
      }
    }
  };

  const onWithdraw = async () => {
    if (+withdrawAmount <= 0) {
      setModal((data) => ({
        ...data,
        visible: true,
        message: TOKENS_INPUT_ERROR_TEXT,
      }));
      return;
    }
    try {
      const withdrawAmountWei = toWei(
        String(withdrawAmount),
        getUnitByDecimal(await instances.bpt.getDecimals())
      );

      setModal((data) => ({
        ...data,
        visible: true,
        message: TX_PENDING_TEXT,
      }));
      const gasForWithdraw = await instances.emPool.methods
        .withdraw(withdrawAmountWei)
        .estimateGas({ from: myWallet });
      await instances.emPool.methods
        .withdraw(withdrawAmountWei)
        .send({ from: myWallet, gas: gasForWithdraw });
      setModal((data) => ({
        ...data,
        visible: true,
        message: TX_SUCCESS_TEXT,
      }));

      initInstances();
      setWithdrawAmount(0);
    } catch (err) {
      if (err.message) {
        setModal((data) => ({ ...data, visible: true, message: err.message }));
      } else {
        console.log(err);
      }
    }
  };

  const onExchange = async () => {
    if (+exchangeAmount <= 0) {
      setModal((data) => ({
        ...data,
        visible: true,
        message: TOKENS_INPUT_ERROR_TEXT,
      }));
      return;
    }
    try {
      const exchangeAmountWei = toWei(
        String(exchangeAmount),
        getUnitByDecimal(eptDecimal)
      );
      const allowance = await instances.ept.methods
        .allowance(myWallet, reservePoolAddress)
        .call();

      if (+exchangeAmountWei > +allowance) {
        setModal((data) => ({ ...data, visible: true, message: APPROVE_TEXT }));
        const gasForApprove = await instances.ept.methods
          .approve(reservePoolAddress, exchangeAmountWei)
          .estimateGas({ from: myWallet });
        await instances.ept.methods
          .approve(reservePoolAddress, exchangeAmountWei)
          .send({ from: myWallet, gas: gasForApprove });
      }

      const finalAllowance = await instances.ept.methods
        .allowance(myWallet, reservePoolAddress)
        .call();
      if (+exchangeAmountWei <= +finalAllowance) {
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_PENDING_TEXT,
        }));
        const gasForExchange = await instances.reservePool.methods
          .receiveInToken(exchangeAmountWei)
          .estimateGas({ from: myWallet });
        await instances.reservePool.methods
          .receiveInToken(exchangeAmountWei)
          .send({ from: myWallet, gas: gasForExchange });
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_SUCCESS_TEXT,
        }));
        initInstances();
        setExchangeAmount(0);
      } else {
        throw new Error(TX_APPROVE_ERROR);
      }
    } catch (err) {
      if (err.message) {
        setModal((data) => ({ ...data, visible: true, message: err.message }));
      } else {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (!instances) return;

    (async () => {
      const myElasticBPTBalance = await instances.emPool.methods
        .getBalanceBpOf(myWallet)
        .call();
      const elasticBPTBalance = await instances.emPool.methods
        .getBalanceBp()
        .call();
      const elasticInBalance = await instances.emPool.methods
        .getBalanceIn()
        .call();
      const isOnHold = await instances.emPool.methods.isOnHold(myWallet).call();
      const holdTime = await instances.emPool.methods.holdTime().call();
      const reservePoolBalance = await instances.reservePool.methods
        .getOutTokenBalance()
        .call();
      const myInputTokenBalance = await instances.inputToken.methods
        .balanceOf(myWallet)
        .call();
      const myEPTBalance = await instances.ept.methods
        .balanceOf(myWallet)
        .call();
      const eptDecimal = await instances.ept.getDecimals();
      const inputTokenDecimal = await instances.inputToken.getDecimals();
      const bptDecimal = await instances.bpt.getDecimals();

      setMyInputTokenBalance(
        fromWei(myInputTokenBalance, getUnitByDecimal(inputTokenDecimal))
      );
      setMyElasticBPTBalance(
        fromWei(myElasticBPTBalance, getUnitByDecimal(bptDecimal))
      );
      setElasticInBalance(
        fromWei(elasticInBalance, getUnitByDecimal(inputTokenDecimal))
      );
      setElasticBPTBalance(
        fromWei(elasticBPTBalance, getUnitByDecimal(bptDecimal))
      );
      setIsOnHold(isOnHold);
      setHoldTime(dayjs.duration(holdTime, "seconds"));
      setReservePoolBalance(
        fromWei(reservePoolBalance, getUnitByDecimal(inputTokenDecimal))
      );
      setMyEPTBalance(fromWei(myEPTBalance, getUnitByDecimal(eptDecimal)));
      setEptDecimal(eptDecimal);
      setInputTokenDecimal(inputTokenDecimal);
    })();
  }, [instances, myWallet]);

  const title = (
    <div className="extended-title">
      {elasticTitle}
      <div className="extended-title-secondary-wrapper">
        <span className="extended-title-secondary-text">
          {balancerPoolTitle}
        </span>
        <a
          href={`https://pools.balancer.exchange/#/pool/${bptAddress}/`}
          target="_blank"
        >
          <ExportOutlined />
        </a>
      </div>
    </div>
  );

  return (
    // <Col span={12} xs={24} md={12} className="panel">
    <>
      <Card title={title} size="small" className="panel">
        <div>
          <div className="text-wrapper">
            <Text type="secondary">
              Available {inputTokenTicker} for staking:{" "}
            </Text>
            <Text>{myInputTokenBalance}</Text>
          </div>
          <div className="text-wrapper">
            <Text type="secondary"> Hold time:</Text>
            {holdTime && (
              <Text>
                {holdTime.asDays()} {holdTime.asDays() === 1 ? "day" : "days"}
              </Text>
            )}
          </div>
          <div className="input-wrapper">
            <InputNumber
              className="input"
              size="large"
              min={getMinDecimalValue(inputTokenDecimal)}
              step={getMinDecimalValue(inputTokenDecimal)}
              max={myInputTokenBalance}
              value={stakeAmount}
              onChange={(v) => setStakeAmount(v)}
            />
            <Button
              type="primary"
              size="large"
              disabled={!+myInputTokenBalance}
              onClick={onStake}
            >
              Stake
            </Button>
          </div>
          <div className="text-wrapper">
            <Text type="secondary">EM Pool Balance: </Text>
            <Text>
              {elasticInBalance} {inputTokenTicker} / {elasticBPTBalance}{" "}
              {bptTicker}
            </Text>
          </div>
          <div className="text-wrapper">
            <Text type="secondary">My EM Pool Balance: </Text>
            <Text>
              {myElasticBPTBalance} {bptTicker}
            </Text>
            <a
              href={`https://etherscan.io/token/${bptAddress}`}
              target="_blank"
            >
              <ExportOutlined />
            </a>
          </div>
          {isOnHold && (
            <div className="text-wrapper">
              <Text type="warning">Your balance is on hold for now </Text>
            </div>
          )}
          {+withdrawAmount > 0 && (
            <div className="text-wrapper">
              <Text type="secondary">Withdraw amount: </Text>
              <Text>{withdrawAmount}</Text>
            </div>
          )}
          <div className="input-wrapper">
            <InputNumber
              className="input"
              size="large"
              min={1}
              max={100}
              value={withdrawPercentage}
              onChange={(v) => withdrawInputHandler(v)}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace("%", "")}
              disabled={!+myElasticBPTBalance || isOnHold}
            />
            <Button
              size="large"
              type="primary"
              disabled={!+myElasticBPTBalance || isOnHold}
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          </div>
        </div>
        <Divider orientation="left">Reserve Pool</Divider>
        <div>
          <div className="text-wrapper">
            <Text type="secondary">Reserve Pool Balance: </Text>
            <Text>
              {reservePoolBalance} {inputTokenTicker}
            </Text>
          </div>
          <div className="text-wrapper">
            <Text type="secondary">My EPT Balance: </Text>
            <Text>
              {myEPTBalance} {eptTicker}
            </Text>
            <a
              href={`https://etherscan.io/token/${eptAddress}`}
              target="_blank"
            >
              <ExportOutlined />
            </a>
          </div>
          <div className="input-wrapper">
            <InputNumber
              className="input"
              size="large"
              min={getMinDecimalValue(eptDecimal)}
              step={getMinDecimalValue(eptDecimal)}
              max={
                +reservePoolBalance <= +myEPTBalance
                  ? reservePoolBalance
                  : myEPTBalance
              }
              value={exchangeAmount}
              onChange={(v) => setExchangeAmount(v)}
            />
            <Button
              type="primary"
              size="large"
              onClick={onExchange}
              disabled={!+reservePoolBalance || !+myEPTBalance}
            >
              Exchange
            </Button>
          </div>
        </div>
      </Card>
      <Modal
        visible={modal.visible}
        title={modal.title}
        centered={true}
        footer={null}
        style={{ textAlign: "center" }}
        onCancel={closeModal}
      >
        {modal.message}
      </Modal>
    </>
    // </Col>
  );
}
