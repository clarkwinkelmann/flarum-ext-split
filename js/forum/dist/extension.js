'use strict';

System.register('davis/split/addSplitControl', ['flarum/extend', 'flarum/app', 'flarum/utils/PostControls', 'flarum/components/Button', 'flarum/components/CommentPost', 'flarum/components/DiscussionPage', 'davis/split/components/SplitPostModal', 'davis/split/components/SplitController'], function (_export, _context) {
    "use strict";

    var extend, app, PostControls, Button, CommentPost, DiscussionPage, SplitPostModal, SplitController;

    _export('default', function (splitController) {

        extend(PostControls, 'moderationControls', function (items, post) {
            var discussion = post.discussion();

            if (post.contentType() !== 'comment' || !discussion.canSplit() || post.data.attributes.number == 1) return;

            items.add('splitFrom', [m(Button, {
                icon: 'code-fork',
                className: 'flagrow-split-startSplitButton',
                // i'm not sure whether setting this attribute on app.current is the correct way,
                // there is a discussion property on this object though
                // luceos on feb 7 2016
                onclick: function onclick() {
                    splitController.start(post.data.attributes.id, post.data.attributes.number, discussion.data.id);
                    splitController.log();
                }
            }, app.translator.trans('flagrow-split.forum.post_controls.split_button'))]);
        });

        extend(CommentPost.prototype, 'footerItems', function (items) {
            var post = this.props.post;
            var discussion = post.discussion();

            if (post.contentType() !== 'comment' || !discussion.canSplit() || post.data.attributes.number == 1) return;

            items.add('splitTo', [m(Button, {
                icon: 'code-fork',
                className: 'flagrow-split-endSplitButton Button Button--link',
                //onclick: () => {app.current.splitting = false},
                // @todo the above is a temporary test solution, we need to implement the modal
                onclick: function onclick() {
                    splitController.end(post.data.attributes.number);
                    splitController.log();
                    var splitModal = new SplitPostModal();
                    splitModal.setController(splitController);
                    app.modal.show(splitModal);
                },
                style: { display: 'none' }
            }, app.translator.trans('flagrow-split.forum.post_footer.split_button'))]);
        });
    });

    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumApp) {
            app = _flarumApp.default;
        }, function (_flarumUtilsPostControls) {
            PostControls = _flarumUtilsPostControls.default;
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton.default;
        }, function (_flarumComponentsCommentPost) {
            CommentPost = _flarumComponentsCommentPost.default;
        }, function (_flarumComponentsDiscussionPage) {
            DiscussionPage = _flarumComponentsDiscussionPage.default;
        }, function (_davisSplitComponentsSplitPostModal) {
            SplitPostModal = _davisSplitComponentsSplitPostModal.default;
        }, function (_davisSplitComponentsSplitController) {
            SplitController = _davisSplitComponentsSplitController.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('davis/split/components/SplitController', [], function (_export, _context) {
    "use strict";

    var SplitController;
    return {
        setters: [],
        execute: function () {
            SplitController = function () {
                function SplitController() {
                    babelHelpers.classCallCheck(this, SplitController);

                    this._isSplitting = false;
                }

                babelHelpers.createClass(SplitController, [{
                    key: 'start',
                    value: function start(postId, postNumber, discussionId) {
                        // should not be necessary
                        if (postId == 1) return;

                        this._startPost = postId;
                        this._discussion = discussionId;
                        this._isSplitting = true;

                        $('.PostStream-item').each(function () {
                            var postIndex = $(this).attr('data-number');
                            if (postIndex > postNumber) {
                                $('.flagrow-split-endSplitButton', $(this)).show();
                            }
                        });
                        $('.flagrow-split-startSplitButton').hide();
                    }
                }, {
                    key: 'end',
                    value: function end(postNumber) {
                        this._endPost = postNumber;
                    }
                }, {
                    key: 'startPost',
                    value: function startPost() {
                        return this._startPost;
                    }
                }, {
                    key: 'endPost',
                    value: function endPost() {
                        return this._endPost;
                    }
                }, {
                    key: 'reset',
                    value: function reset() {
                        this._isSplitting = false;
                        this._startPost = null;
                        this._endPost = null;
                    }
                }, {
                    key: 'log',
                    value: function log() {
                        console.log('splitting:' + this._isSplitting);
                        console.log('discussion:' + this._discussion);
                        console.log('startPost:' + this._startPost);
                        console.log('endPost:' + this._endPost);
                    }
                }]);
                return SplitController;
            }();

            _export('default', SplitController);
        }
    };
});;
'use strict';

System.register('davis/split/components/SplitPostModal', ['flarum/components/Modal', 'flarum/components/Button', 'flarum/models/Discussion', 'davis/split/components/SplitController'], function (_export, _context) {
    "use strict";

    var Modal, Button, Discussion, SplitController, SplitPostModal;
    return {
        setters: [function (_flarumComponentsModal) {
            Modal = _flarumComponentsModal.default;
        }, function (_flarumComponentsButton) {
            Button = _flarumComponentsButton.default;
        }, function (_flarumModelsDiscussion) {
            Discussion = _flarumModelsDiscussion.default;
        }, function (_davisSplitComponentsSplitController) {
            SplitController = _davisSplitComponentsSplitController.default;
        }],
        execute: function () {
            SplitPostModal = function (_Modal) {
                babelHelpers.inherits(SplitPostModal, _Modal);

                function SplitPostModal() {
                    babelHelpers.classCallCheck(this, SplitPostModal);
                    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SplitPostModal).apply(this, arguments));
                }

                babelHelpers.createClass(SplitPostModal, [{
                    key: 'init',
                    value: function init() {
                        babelHelpers.get(Object.getPrototypeOf(SplitPostModal.prototype), 'init', this).call(this);

                        this.success = false;

                        this.gotError = false;

                        this.newDiscussionTitle = m.prop('');
                    }
                }, {
                    key: 'setController',
                    value: function setController(splitController) {
                        this.splitController = splitController;

                        this.splitController.log();
                    }
                }, {
                    key: 'className',
                    value: function className() {
                        return 'SplitPostModal Modal--small';
                    }
                }, {
                    key: 'title',
                    value: function title() {
                        return app.translator.trans('flagrow-split.forum.modal.title');
                    }
                }, {
                    key: 'content',
                    value: function content() {
                        if (this.success && !this.gotError) {
                            return [m('div', { className: 'Modal-body' }, [m('div', { className: 'Form Form--centered' }, [m('p', { className: 'helpText' }, app.translator.trans('flagrow-split.forum.modalconfirmation_message')), m('div', { className: 'Form-group' }, [m(Button, {
                                className: 'Button Button--primary Button--block',
                                onclick: this.hide.bind(this)
                            }, app.translator.trans('flagrow-split.forum.modal.dismiss_button'))])])])];
                        }

                        return [m('div', { className: 'Modal-body' }, [m('div', { className: 'Form Form--centered' }, [m('div', { className: 'Form-group' }, [m('label', {}, app.translator.trans('flagrow-split.forum.modal.new_discussion_label')), m('input', {
                            name: 'new_discussion_title',
                            value: this.newDiscussionTitle(),
                            oninput: m.withAttr('value', this.newDiscussionTitle)
                        })]), m('div', { className: 'Form-group' }, [m(Button, {
                            className: 'Button Button--primary Button--block',
                            type: 'submit',
                            loading: this.loading,
                            disabled: !this.newDiscussionTitle()
                        }, app.translator.trans('flagrow-split.forum.modal.submit_button'))])])])];
                    }
                }, {
                    key: 'onsubmit',
                    value: function onsubmit(e) {
                        var _this2 = this;

                        e.preventDefault();

                        this.loading = true;

                        var data = new FormData();

                        data.append('title', this.newDiscussionTitle());
                        data.append('start_post_id', this.splitController.startPost());
                        data.append('end_post_number', this.splitController.endPost());

                        app.request({
                            method: 'POST',
                            url: app.forum.attribute('apiUrl') + '/split',
                            serialize: function serialize(raw) {
                                return raw;
                            },
                            data: data
                        }).then(function (discussion) {
                            discussion.data.id = m.prop(discussion.data.id);
                            discussion.data.attributes.slug = m.prop(discussion.data.attributes.slug);
                            discussion.data.attributes.startUser = m.prop(discussion.data.attributes.startUser);
                            discussion.data.attributes.isUnread = m.prop(discussion.data.attributes.isUnread);
                            console.log(discussion.data);
                            app.cache.discussionList.addDiscussion(discussion.data);
                            _this2.success = true;
                            _this2.hide();
                            console.log(app.route.discussion(discussion.data));
                            m.route(app.route.discussion(discussion.data));
                        }, this.loaded.bind(this));
                    }
                }]);
                return SplitPostModal;
            }(Modal);

            _export('default', SplitPostModal);
        }
    };
});;
'use strict';

System.register('davis/split/extendDiscussionPage', ['flarum/extend', 'flarum/components/DiscussionPage'], function (_export, _context) {
    "use strict";

    var extend, DiscussionPage;

    _export('default', function () {
        extend(DiscussionPage.prototype, 'init', function () {
            this.splitting = false;
        });
    });

    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumComponentsDiscussionPage) {
            DiscussionPage = _flarumComponentsDiscussionPage.default;
        }],
        execute: function () {}
    };
});;
'use strict';

System.register('davis/split/main', ['flarum/extend', 'flarum/Model', 'flarum/models/Discussion', 'davis/split/addSplitControl', 'davis/split/components/SplitController'], function (_export, _context) {
    "use strict";

    var extend, Model, Discussion, addSplitControl, SplitController;
    return {
        setters: [function (_flarumExtend) {
            extend = _flarumExtend.extend;
        }, function (_flarumModel) {
            Model = _flarumModel.default;
        }, function (_flarumModelsDiscussion) {
            Discussion = _flarumModelsDiscussion.default;
        }, function (_davisSplitAddSplitControl) {
            addSplitControl = _davisSplitAddSplitControl.default;
        }, function (_davisSplitComponentsSplitController) {
            SplitController = _davisSplitComponentsSplitController.default;
        }],
        execute: function () {

            //import extendDiscussionPage from 'flagrow/split/extendDiscussionPage';

            app.initializers.add('davis-split', function (app) {

                app.store.models.discussions.prototype.canSplit = Model.attribute('canSplit');

                //extendDiscussionPage();

                var splitController = new SplitController();
                console.log(splitController);

                addSplitControl(splitController);
            });
        }
    };
});