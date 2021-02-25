import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { utils } from "web3";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { getUnitByDecimal, minTwoDigits, getMinDecimalValue } from "../utils";
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

const { fromWei, toWei } = utils;
dayjs.extend(duration);
const { Text } = Typography;

export default function Volatile({ instances, initInstances, config }) {
  const {
    volatilePoolAddress,
    vpStorageAddress,
    vptAddress,
    inputTokenTicker,
    vptTicker,
  } = config;

  const [myInputTokenBalance, setMyInputTokenBalance] = useState();
  const [myVPTBalance, setMyVPTBalance] = useState();
  const [inputTokenDecimal, setInputTokenDecimal] = useState();
  const [vptDecimal, setVptDecimal] = useState();
  const [vpStorageBalance, setVpStorageBalance] = useState();
  const [myRequestedBalance, setMyRequestedBalance] = useState();
  const [stakeAmount, setStakeAmount] = useState();
  const [requestAmount, setRequestAmount] = useState();
  const [requestAvailable, setRequestAvailable] = useState();
  const [holdTimeRemains, setHoldTimeRemains] = useState();
  const [holdFinishDate, setHoldFinishDate] = useState();
  const [isAbleToExchange, setIsAbleToExchange] = useState();
  const [modal, setModal] = useState({
    title: "",
    visible: false,
    message: "",
  });

  const { account } = useWeb3React();

  const closeModal = () =>
    setModal((data) => ({ ...data, visible: false, message: "" }));

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
        .allowance(account, volatilePoolAddress)
        .call();

      if (+stakeAmountWei > +allowance) {
        setModal((data) => ({ ...data, visible: true, message: APPROVE_TEXT }));
        const gasForApprove = await instances.inputToken.methods
          .approve(volatilePoolAddress, stakeAmountWei)
          .estimateGas({ from: account });
        await instances.inputToken.methods
          .approve(volatilePoolAddress, stakeAmountWei)
          .send({ from: account, gas: gasForApprove });
      }

      const finalAllowance = await instances.inputToken.methods
        .allowance(account, volatilePoolAddress)
        .call();
      if (+stakeAmountWei <= +finalAllowance) {
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_PENDING_TEXT,
        }));
        const gasForStake = await instances.volatilePool.methods
          .receiveInToken(stakeAmountWei)
          .estimateGas({ from: account });
        await instances.volatilePool.methods
          .receiveInToken(stakeAmountWei)
          .send({ from: account, gas: gasForStake });
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

  const onRequest = async () => {
    if (+requestAmount <= 0) {
      setModal((data) => ({
        ...data,
        visible: true,
        message: TOKENS_INPUT_ERROR_TEXT,
      }));
      return;
    }
    try {
      const requestAmountWei = toWei(
        String(requestAmount),
        getUnitByDecimal(vptDecimal)
      );
      const allowance = await instances.vpt.methods
        .allowance(account, vpStorageAddress)
        .call();

      if (+requestAmountWei > +allowance) {
        setModal((data) => ({ ...data, visible: true, message: APPROVE_TEXT }));
        const gasForApprove = await instances.vpt.methods
          .approve(vpStorageAddress, requestAmountWei)
          .estimateGas({ from: account });
        await instances.vpt.methods
          .approve(vpStorageAddress, requestAmountWei)
          .send({ from: account, gas: gasForApprove });
      }

      const finalAllowance = await instances.vpt.methods
        .allowance(account, vpStorageAddress)
        .call();
      if (+requestAmountWei <= +finalAllowance) {
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_PENDING_TEXT,
        }));
        const gasForRequest = await instances.vpStorage.methods
          .requestExchange(requestAmountWei)
          .estimateGas({ from: account });
        await instances.vpStorage.methods
          .requestExchange(requestAmountWei)
          .send({ from: account, gas: gasForRequest });
        setModal((data) => ({
          ...data,
          visible: true,
          message: TX_SUCCESS_TEXT,
        }));
        initInstances();
        setRequestAmount(0);
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

  const onExchange = async () => {
    try {
      setModal((data) => ({
        ...data,
        visible: true,
        message: TX_PENDING_TEXT,
      }));
      const gasForExchange = await instances.vpStorage.methods
        .executeExchange()
        .estimateGas({ from: account });
      await instances.vpStorage.methods
        .executeExchange()
        .send({ from: account, gas: gasForExchange });
      setModal((data) => ({
        ...data,
        visible: true,
        message: TX_SUCCESS_TEXT,
      }));

      initInstances();
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
      const startTime = await instances.vpStorage.methods
        .periodStartTime()
        .call();
      const time = await instances.vpStorage.methods.periodTime().call();
      setHoldFinishDate(dayjs.unix(startTime).add(time, "s"));

      const myInputTokenBalance = await instances.inputToken.methods
        .balanceOf(account)
        .call();
      const myVPTBalance = await instances.vpt.methods
        .balanceOf(account)
        .call();
      const myRequestedBalance = await instances.vpStorage.methods
        .balanceOf(account)
        .call();
      const vpStorageBalance = await instances.vpStorage.methods
        .getOutTokenForExchange()
        .call();
      const calculateIn = await instances.vpStorage.methods
        .calculateIn(account)
        .call();
      const inputTokenDecimal = await instances.inputToken.getDecimals();
      const vptDecimal = await instances.vpt.getDecimals();
      setMyInputTokenBalance(
        fromWei(myInputTokenBalance, getUnitByDecimal(inputTokenDecimal))
      );
      setMyVPTBalance(fromWei(myVPTBalance, getUnitByDecimal(vptDecimal)));
      setMyRequestedBalance(
        fromWei(myRequestedBalance, getUnitByDecimal(vptDecimal))
      );
      setVpStorageBalance(
        fromWei(vpStorageBalance, getUnitByDecimal(vptDecimal))
      );
      setRequestAvailable(fromWei(calculateIn, getUnitByDecimal(vptDecimal)));
      setIsAbleToExchange(myRequestedBalance > 0);
      setInputTokenDecimal(inputTokenDecimal);
      setVptDecimal(vptDecimal);
    })();
  }, [instances, account]);

  useEffect(() => {
    if (!holdFinishDate) return;
    const interval = setInterval(tick, 1000);

    function tick() {
      const untilEnd = dayjs.duration(holdFinishDate.diff(dayjs()));
      if (untilEnd.asSeconds() <= 0) {
        setHoldTimeRemains("00:00:00");
        setIsAbleToExchange(myRequestedBalance > 0);
        clearInterval(interval);
        return;
      }
      const holdTimeRemains = `${minTwoDigits(untilEnd.hours())}:${minTwoDigits(
        untilEnd.minutes()
      )}:${minTwoDigits(untilEnd.seconds())}`;
      setHoldTimeRemains(holdTimeRemains);
      setIsAbleToExchange(false);
    }

    return () => clearInterval(interval);
  }, [holdFinishDate, myRequestedBalance]);

  return (
    // <Col span={12} xs={24} md={12} className="panel">
    <>
      <Card title="Volatile pool" size="small" className="panel">
        <div>
          <div className="text-wrapper">
            <Text type="secondary">
              Available {inputTokenTicker} for staking:{" "}
            </Text>
            <Text>{myInputTokenBalance}</Text>
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
        </div>

        <Divider orientation="left">Storage</Divider>

        <div>
          <div className="text-wrapper">
            <Text type="secondary">Storage Balance: </Text>
            <Text>
              {vpStorageBalance} {inputTokenTicker}
            </Text>
          </div>
          <div className="text-wrapper">
            <Text type="secondary">My VPT Balance: </Text>
            <Text>
              {myVPTBalance} {vptTicker}
            </Text>
            <a
              href={`https://etherscan.io/token/${vptAddress}`}
              target="_blank"
            >
              <ExportOutlined />
            </a>
          </div>
          <div className="text-wrapper">
            <Text type="secondary">My requested Balance: </Text>
            <Text>{myRequestedBalance}</Text>
          </div>
          {+requestAvailable > 0 && +myRequestedBalance > 0 && (
            <div className="text-wrapper">
              <Text type="secondary">Available for request: </Text>
              <Text>{requestAvailable}</Text>
            </div>
          )}
          <div className="input-wrapper">
            <InputNumber
              className="input"
              size="large"
              min={getMinDecimalValue(vptDecimal)}
              step={getMinDecimalValue(vptDecimal)}
              max={
                +requestAvailable <= +myVPTBalance
                  ? requestAvailable
                  : myVPTBalance
              }
              value={requestAmount}
              onChange={(v) => setRequestAmount(v)}
            />
            <Button
              type="primary"
              size="large"
              onClick={onRequest}
              disabled={!+requestAvailable || !+myVPTBalance}
            >
              Request
            </Button>
          </div>
          <Divider />
          <div className="input-wrapper">
            <div className="text-wrapper">
              <Text type="secondary">Hold ends in: </Text>
              <Text>{holdTimeRemains}</Text>
            </div>
            <Button
              size="large"
              disabled={!isAbleToExchange}
              type="primary"
              onClick={onExchange}
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
