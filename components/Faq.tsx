import React from "react"
import {Col, Card} from "antd"


export default function Faq({config} : any){

  const {
    elasticTitle, balancerPoolTitle, inputTokenTicker, eptPercentage, vptPercentage,
    bptAddress, balancerCounterCurrencyTicker, vptTicker, eptTicker
  } = config
  
  return (
    <Col span={24} className="panel-faq">
      <h2>FAQ</h2>
      <Card>
        <h3>What is {elasticTitle}?</h3>
        <p>
          User Alice wants to earn in {inputTokenTicker}. She places {inputTokenTicker} in the {elasticTitle},
           and our Elastic Module places these funds in the{" "}
          <a href={`https://pools.balancer.exchange/#/pool/${bptAddress}/`} target="_blank">
            {balancerPoolTitle} pool.
          </a>{" "}
          Alice's funds start generating profits in the form of swap fees and
          BAL token rewards. In case of {balancerCounterCurrencyTicker} falling, Alice's drawdown will be
          compensated to the specified range from the Reserve Pool (if there are
          funds there), for covering the drawdown the Elastic Module takes a
          part of the profit and gives it to liquidity providers of the Volatile
          pool.
        </p>

        <h3>What is a Volatile Pool?</h3>
        <p>
          Bob wants to gain +50% of his funds in {inputTokenTicker}, and he is ready to take
          risks. He places funds in {inputTokenTicker} in the Volatile pool, and our Elastic
          Module places them in the Reserve Pool to cover drawdowns in the {elasticTitle} and mints Bob {vptTicker} tokens at 1:1.5 ratio. Bob gets
          part of {elasticTitle} profit for providing liquidity to the
          Reserve Pool. The profit intended for Bob goes to Storage, where he
          can exchange his {vptTicker} tokens to {inputTokenTicker} at a 1:1 ratio.
        </p>

        <h3>Reserve Pool</h3>
        <p>
          This pool is designed to cover Alice's drawdown when the {balancerCounterCurrencyTicker} price
          falls. All {inputTokenTicker} staked in the Volatile pool by Bob go here.
        </p>

        <h3>Storage</h3>
        <p>
          This pool is designed to reward Bob for providing liquidity to the
          Reserve Pool. 20% of Alice's profit and 100% of BAL rewards go to this
          pool.
        </p>

        <h3>What is {eptTicker}?</h3>
        <p>
          If during withdrawal Alice receives fewer {inputTokenTicker} than she has put in the
          pool, she will be minted with {eptTicker} tokens, up to a certain value
          specified when creating a contract.
        </p>
        <p>
          In this contract, it is equal to: <strong>{eptPercentage}%</strong>.
        </p>
        <p>
          After that, Alice can exchange them for {inputTokenTicker}, if they are present in
          the Reserve Pool.
        </p>

        <h3>What is {vptTicker}?</h3>
        <p>
          When staking {inputTokenTicker}, Bob gets a certain amount of {vptTicker}, depending on the
          ratio specified when creating a contract.
        </p>
        <p>
          In this contract it is equal to: <strong>{vptPercentage}%</strong>.
        </p>
        <p>
          Bob can change his {vptTicker} back to {inputTokenTicker} in the Storage, if they are
          available.
        </p>
        <p>
          All exchange requests have a hold period of 1 day starting from the
          first exchange request. In case the amount of {inputTokenTicker} in the Storage is
          smaller, they will be proportionally distributed among the
          participants who submitted the exchange request.
        </p>
        <p>
          Further iterations will be repeated when new exchange requests are
          received.
        </p>

        <h3>Hold</h3>
        <p>
          The time during which Alice cannot withdraw {inputTokenTicker} from the pool. It is
          necessary to accumulate certain income from swap fees and Balancer
          pool rewards. When adding funds, the Hold period begins all over again
          for the full amount.
        </p>
        <p>
          Hold period: <strong>90 days</strong>.
        </p>
      </Card>
    </Col>
  );
}
