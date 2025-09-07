import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can preorder and register a domain",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Test domain name and salt
        const domainName = "testdomain";
        const salt = 12345;
        
        // Calculate name hash (simplified for test)
        const nameHash = "0x1234567890123456789012345678901234567890";
        const stxBurned = 1000000; // 1 STX
        
        let block = chain.mineBlock([
            // Preorder the domain
            Tx.contractCall('better-bns', 'preorder-name', [
                types.buff(nameHash),
                types.uint(stxBurned)
            ], user1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Mine a block to meet the delay requirement
        chain.mineEmptyBlock(1);
        
        block = chain.mineBlock([
            // Register the domain
            Tx.contractCall('better-bns', 'register-name', [
                types.ascii(domainName),
                types.uint(salt)
            ], user1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), domainName);
        
        // Verify domain registration
        const domainInfo = chain.callReadOnlyFn(
            'better-bns',
            'get-domain-info',
            [types.ascii(domainName)],
            user1.address
        );
        
        const domain = domainInfo.result.expectSome().expectTuple();
        assertEquals(domain['owner'], user1.address);
    },
});

Clarinet.test({
    name: "Cannot register domain without preorder",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('better-bns', 'register-name', [
                types.ascii("testdomain"),
                types.uint(12345)
            ], user1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectErr(types.uint(101)); // err-not-found
    },
});

Clarinet.test({
    name: "Can transfer domain to another user",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        // Setup: Register a domain first
        const domainName = "transfertest";
        const nameHash = "0x1234567890123456789012345678901234567891";
        
        let block = chain.mineBlock([
            Tx.contractCall('better-bns', 'preorder-name', [
                types.buff(nameHash),
                types.uint(1000000)
            ], user1.address)
        ]);
        
        chain.mineEmptyBlock(1);
        
        block = chain.mineBlock([
            Tx.contractCall('better-bns', 'register-name', [
                types.ascii(domainName),
                types.uint(12345)
            ], user1.address)
        ]);
        
        // Transfer the domain
        block = chain.mineBlock([
            Tx.contractCall('better-bns', 'transfer-name', [
                types.ascii(domainName),
                types.principal(user2.address)
            ], user1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Verify transfer
        const domainInfo = chain.callReadOnlyFn(
            'better-bns',
            'get-domain-info',
            [types.ascii(domainName)],
            user1.address
        );
        
        const domain = domainInfo.result.expectSome().expectTuple();
        assertEquals(domain['owner'], user2.address);
    },
});
