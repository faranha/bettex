import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
import demoTestnetRouter from "./demo-testnet";
import testAccountsRouter from "./test-accounts";
import testContractRouter from "./test-contract";
import nativeJourneyRouter from "./native-journey";
import historyRouter from "./history";
import treasuryGovernanceRouter from "./treasury-governance";
import alphaRouter from "./alpha";
import alphaTradingRouter from "./alpha-trading";
import tradingPoliciesRouter from "./trading-policies";
import simulationRouter from "./simulation";
import alloraRouter from "./allora";
import agentOperationsRouter from "./agent-operations";
import marketLiveRouter from "./market-live";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoTestnetRouter);
router.use(demoRouter);
router.use(testAccountsRouter);
router.use(testContractRouter);
router.use(nativeJourneyRouter);
router.use(historyRouter);
router.use(treasuryGovernanceRouter);
router.use(alphaRouter);
router.use(alphaTradingRouter);
router.use(tradingPoliciesRouter);
router.use(simulationRouter);
router.use(alloraRouter);
router.use(agentOperationsRouter);
router.use(marketLiveRouter);

export default router;
