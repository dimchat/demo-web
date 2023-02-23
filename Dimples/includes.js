
var dim_common = [
    /* DIM Common */

    'src/common/protocol/handshake.js',
    'src/common/protocol/receipt.js',
    'src/common/protocol/login.js',
    'src/common/protocol/report.js',
    'src/common/protocol/mute.js',
    'src/common/protocol/block.js',
    'src/common/protocol/search.js',
    'src/common/protocol/storage.js',

    'src/common/dbi/base.js',
    'src/common/dbi/private.js',
    'src/common/dbi/meta.js',
    'src/common/dbi/document.js',
    'src/common/dbi/user.js',
    'src/common/dbi/group.js',
    'src/common/dbi/login.js',
    'src/common/dbi/message.js',
    'src/common/dbi/provider.js',

    'src/common/database/private.js',
    'src/common/database/meta.js',
    'src/common/database/document.js',

    'src/common/mem/checker.js',
    'src/common/mem/cache.js',

    'src/common/network/transmitter.js',
    'src/common/network/wrapper.js',
    'src/common/network/queue.js',
    'src/common/network/gatekeeper.js',
    'src/common/network/session.js',

    'src/common/anonymous.js',
    'src/common/register.js',
    'src/common/ans.js',
    'src/common/facebook.js',
    'src/common/factories.js',
    'src/common/keycache.js',
    'src/common/messenger.js',

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
