import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
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

const router: IRouter = Router();

router.use(healthRouter);
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

export default router;
