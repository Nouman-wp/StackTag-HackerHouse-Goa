import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can add SBT category and issue SBT",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            // Add a new SBT category
            Tx.contractCall('better-sbt', 'add-category', [
                types.ascii("developer"),
                types.utf8("Developer"),
                types.utf8("Software development achievements")
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        block = chain.mineBlock([
            // Issue an SBT
            Tx.contractCall('better-sbt', 'issue-sbt', [
                types.principal(user1.address),
                types.utf8("ipfs://QmExample123"),
                types.ascii("developer")
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        const sbtId = block.receipts[0].result.expectOk();
        assertEquals(sbtId, types.uint(1));
        
        // Verify SBT was created
        const sbtInfo = chain.callReadOnlyFn(
            'better-sbt',
            'get-sbt',
            [types.uint(1)],
            deployer.address
        );
        
        const sbt = sbtInfo.result.expectSome().expectTuple();
        assertEquals(sbt['recipient'], user1.address);
        assertEquals(sbt['issuer'], deployer.address);
        assertEquals(sbt['category'], "developer");
    },
});

Clarinet.test({
    name: "Can authorize issuer and they can issue SBTs",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const issuer = accounts.get('wallet_1')!;
        const recipient = accounts.get('wallet_2')!;
        
        // Add category first
        let block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'add-category', [
                types.ascii("contributor"),
                types.utf8("Contributor"),
                types.utf8("Project contribution achievements")
            ], deployer.address)
        ]);
        
        // Authorize issuer
        block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'authorize-issuer', [
                types.principal(issuer.address)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Issuer can now issue SBTs
        block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'issue-sbt', [
                types.principal(recipient.address),
                types.utf8("ipfs://QmContributor456"),
                types.ascii("contributor")
            ], issuer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        const sbtId = block.receipts[0].result.expectOk();
        
        // Verify SBT
        const sbtInfo = chain.callReadOnlyFn(
            'better-sbt',
            'get-sbt',
            [sbtId],
            deployer.address
        );
        
        const sbt = sbtInfo.result.expectSome().expectTuple();
        assertEquals(sbt['recipient'], recipient.address);
        assertEquals(sbt['issuer'], issuer.address);
    },
});

Clarinet.test({
    name: "Cannot issue SBT without authorization",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const unauthorized = accounts.get('wallet_1')!;
        const recipient = accounts.get('wallet_2')!;
        
        // Add category
        let block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'add-category', [
                types.ascii("test"),
                types.utf8("Test"),
                types.utf8("Test category")
            ], deployer.address)
        ]);
        
        // Try to issue SBT without authorization
        block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'issue-sbt', [
                types.principal(recipient.address),
                types.utf8("ipfs://QmUnauthorized"),
                types.ascii("test")
            ], unauthorized.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectErr(types.uint(203)); // err-unauthorized
    },
});

Clarinet.test({
    name: "Can revoke SBT",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const recipient = accounts.get('wallet_1')!;
        
        // Setup: Add category and issue SBT
        let block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'add-category', [
                types.ascii("revokable"),
                types.utf8("Revokable"),
                types.utf8("Revokable test category")
            ], deployer.address),
            Tx.contractCall('better-sbt', 'issue-sbt', [
                types.principal(recipient.address),
                types.utf8("ipfs://QmRevokable"),
                types.ascii("revokable")
            ], deployer.address)
        ]);
        
        const sbtId = block.receipts[1].result.expectOk();
        
        // Revoke the SBT
        block = chain.mineBlock([
            Tx.contractCall('better-sbt', 'revoke-sbt', [
                sbtId
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Verify SBT is no longer verified
        const sbtInfo = chain.callReadOnlyFn(
            'better-sbt',
            'get-sbt',
            [sbtId],
            deployer.address
        );
        
        const sbt = sbtInfo.result.expectSome().expectTuple();
        assertEquals(sbt['verified'], false);
    },
});
