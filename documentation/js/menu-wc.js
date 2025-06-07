'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">facial-attendance-system documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AttendanceModule.html" data-type="entity-link" >AttendanceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' : 'data-bs-target="#xs-controllers-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' :
                                            'id="xs-controllers-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' }>
                                            <li class="link">
                                                <a href="controllers/AttendanceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AttendanceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' : 'data-bs-target="#xs-injectables-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' :
                                        'id="xs-injectables-links-module-AttendanceModule-e0ec2c43b66fdef8fcfd1b6c1718e864a5fb0c80f844e0d46abe5412ccf0d0c28307f3d58e0467a01257bbc119521e6f24bc4147152cbdd9c7d9e6702b6d12c7"' }>
                                        <li class="link">
                                            <a href="injectables/AttendanceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AttendanceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CameraModule.html" data-type="entity-link" >CameraModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' : 'data-bs-target="#xs-controllers-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' :
                                            'id="xs-controllers-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' }>
                                            <li class="link">
                                                <a href="controllers/CameraController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CameraController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' : 'data-bs-target="#xs-injectables-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' :
                                        'id="xs-injectables-links-module-CameraModule-280b1dfc164058568b658e89746a8aaa9ebd9fa5f28994c3336f6082e542a51bddb97fe30aac8d9570a60fa0e1996e511f7d93b86020e19182f687c2a8299432"' }>
                                        <li class="link">
                                            <a href="injectables/CameraService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CameraService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FaceRecognitionModule.html" data-type="entity-link" >FaceRecognitionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' : 'data-bs-target="#xs-controllers-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' :
                                            'id="xs-controllers-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' }>
                                            <li class="link">
                                                <a href="controllers/FaceRecognitionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FaceRecognitionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' : 'data-bs-target="#xs-injectables-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' :
                                        'id="xs-injectables-links-module-FaceRecognitionModule-4298b4e75e50dab8158c81fa2c915198203bc74f9c1ae2794194f5326e8924589ccccd3985bff1f042271dbede772cd4c4757b1de543817fed66be5d6cc42884"' }>
                                        <li class="link">
                                            <a href="injectables/FaceRecognitionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FaceRecognitionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/GatewayModule.html" data-type="entity-link" >GatewayModule</a>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AttendanceController.html" data-type="entity-link" >AttendanceController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/CameraController.html" data-type="entity-link" >CameraController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/CameraController-1.html" data-type="entity-link" >CameraController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/FaceRecognitionController.html" data-type="entity-link" >FaceRecognitionController</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/FaceEntity.html" data-type="entity-link" >FaceEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Students.html" data-type="entity-link" >Students</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/FaceGateway.html" data-type="entity-link" >FaceGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/MarkAttendanceDto.html" data-type="entity-link" >MarkAttendanceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockEnrollDto.html" data-type="entity-link" >MockEnrollDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AttendanceService.html" data-type="entity-link" >AttendanceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CameraService.html" data-type="entity-link" >CameraService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FaceRecognitionService.html" data-type="entity-link" >FaceRecognitionService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/FaceDescriptorData.html" data-type="entity-link" >FaceDescriptorData</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});