module hivemind::escrow {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{String};
    use std::option::{Self, Option};

    // --- Error Codes ---
    const ENotJobPoster: u64 = 0;
    const ENotJobWorker: u64 = 1;
    const EInvalidStatus: u64 = 2;

    // --- Status Codes ---
    const STATUS_OPEN: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_DELIVERED: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;
    const STATUS_DISPUTED: u8 = 4;

    // --- Objects ---

    public struct Job has key, store {
        id: UID,
        poster: address,
        worker: Option<address>,
        payment: Coin<SUI>,
        description: String,
        deliverable_hash: Option<String>,
        deadline: u64,
        status: u8,
    }

    // --- Events ---

    public struct JobPosted has copy, drop {
        job_id: ID,
        poster: address,
        payment_amount: u64,
    }

    public struct JobAccepted has copy, drop {
        job_id: ID,
        worker: address,
    }

    public struct WorkSubmitted has copy, drop {
        job_id: ID,
        deliverable_hash: String,
    }

    public struct PaymentReleased has copy, drop {
        job_id: ID,
        worker: address,
        amount: u64,
    }

    // --- Functions ---

    public entry fun post_job(
        payment: Coin<SUI>,
        description: String,
        deadline: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let amount = coin::value(&payment);
        let id = object::new(ctx);
        let job_id = object::uid_to_inner(&id);

        let job = Job {
            id,
            poster: sender,
            worker: option::none(),
            payment,
            description,
            deliverable_hash: option::none(),
            deadline,
            status: STATUS_OPEN,
        };

        transfer::share_object(job);

        event::emit(JobPosted {
            job_id,
            poster: sender,
            payment_amount: amount,
        });
    }

    public entry fun accept_job(job: &mut Job, ctx: &mut TxContext) {
        assert!(job.status == STATUS_OPEN, EInvalidStatus);
        let sender = tx_context::sender(ctx);
        
        job.worker = option::some(sender);
        job.status = STATUS_IN_PROGRESS;

        event::emit(JobAccepted {
            job_id: object::uid_to_inner(&job.id),
            worker: sender,
        });
    }

    public entry fun submit_work(job: &mut Job, deliverable_hash: String, ctx: &mut TxContext) {
        assert!(job.status == STATUS_IN_PROGRESS, EInvalidStatus);
        let sender = tx_context::sender(ctx);
        assert!(option::borrow(&job.worker) == &sender, ENotJobWorker);

        job.deliverable_hash = option::some(deliverable_hash);
        job.status = STATUS_DELIVERED;

        event::emit(WorkSubmitted {
            job_id: object::uid_to_inner(&job.id),
            deliverable_hash,
        });
    }

    public entry fun release_payment(job: &mut Job, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(job.poster == sender, ENotJobPoster);
        assert!(job.status == STATUS_DELIVERED, EInvalidStatus);

        let worker_addr = *option::borrow(&job.worker);
        let amount = coin::value(&job.payment);
        
        // Transfer the payment to the worker
        let payment_coin = coin::split(&mut job.payment, amount, ctx);
        transfer::public_transfer(payment_coin, worker_addr);

        job.status = STATUS_COMPLETED;

        event::emit(PaymentReleased {
            job_id: object::uid_to_inner(&job.id),
            worker: worker_addr,
            amount,
        });
    }

    // Simple refund for disputed/expired jobs (only poster can call if no work submitted or worker agrees)
    public entry fun dispute_job(job: &mut Job, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(job.poster == sender, ENotJobPoster);
        // For simplicity, allow refund if it hasn't been completed or released
        assert!(job.status != STATUS_COMPLETED && job.status != STATUS_DELIVERED, EInvalidStatus);

        let amount = coin::value(&job.payment);
        let refund_coin = coin::split(&mut job.payment, amount, ctx);
        transfer::public_transfer(refund_coin, job.poster);

        job.status = STATUS_DISPUTED;
    }
}
