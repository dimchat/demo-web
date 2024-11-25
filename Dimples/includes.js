
var dim_common = [
    /* DIM Common */

    'src/common/compat/base.js',
    'src/common/compat/compatible.js',
    'src/common/compat/network.js',
    'src/common/compat/btc.js',
    'src/common/compat/entity.js',
    'src/common/compat/meta.js',

    'src/common/mem/cache.js',

    'src/common/protocol/block.js',
    'src/common/protocol/handshake.js',
    'src/common/protocol/login.js',
    'src/common/protocol/mute.js',
    'src/common/protocol/report.js',
    'src/common/protocol/search.js',
    'src/common/protocol/storage.js',

    'src/common/dbi/account.js',
    'src/common/dbi/message.js',
    'src/common/dbi/session.js',

    'src/common/database/private.js',
    'src/common/database/meta.js',
    'src/common/database/document.js',

    'src/common/anonymous.js',
    'src/common/ans.js',
    'src/common/archivist.js',
    'src/common/facebook.js',
    'src/common/messenger.js',
    'src/common/packer.js',
    'src/common/processor.js',
    'src/common/register.js',

    'src/common/factories.js',

    //
    //  Group
    //

    'src/group/delegate.js',
    'src/group/admin.js',     // -> delegate
    'src/group/helper.js',    // -> delegate
    'src/group/packer.js',    // -> delegate
    'src/group/builder.js',   // -> delegate, helper
    'src/group/emitter.js',   // -> delegate, packer
    'src/group/manager.js',   // -> delegate, helper, builder, packer
    'src/group/shared.js',    // -> delegate, admin, emitter, manager

    //
    //  Network
    //

    'src/network/wrapper.js',
    'src/network/queue.js',
    'src/network/gate.js',
    'src/network/gatekeeper.js',
    'src/network/transmitter.js',
    'src/network/session.js',

    null
];

var dim_client = [
    /* DIM Client */

    'src/client/network/fsm.js',
    'src/client/network/http.js',
    'src/client/network/session.js',
    'src/client/network/terminal.js',

    'src/client/cpu/handshake.js',
    'src/client/cpu/login.js',
    'src/client/cpu/receipt.js',
    'src/client/cpu/history.js',
    'src/client/cpu/group.js',
    'src/client/cpu/group/invite.js',
    'src/client/cpu/group/expel.js',
    'src/client/cpu/group/quit.js',
    'src/client/cpu/group/query.js',
    'src/client/cpu/group/reset.js',
    'src/client/cpu/creator.js',

    'src/client/messenger.js',
    'src/client/packer.js',
    'src/client/processor.js',

    null
];
