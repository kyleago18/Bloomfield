<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:process-existing-product-images')]
#[Description('Command description')]
class ProcessExistingProductImages extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
