import $i18n from '../../i18n';
const ASSET_ID = 'XlabPropertiesPanel';
const info = {
  id: ASSET_ID,
  name: $i18n.get({
    id: 'gi-assets-xlab.components.XlabPropertiesPanel.info.XlabPropertiesPanel',
    dm: 'Xlab 属性面板',
  }),
  desc: $i18n.get({
    id: 'gi-assets-xlab.components.XlabPropertiesPanel.info.XlabPropertiesPanel',
    dm: 'Xlab 属性面板',
  }),
  cover: 'http://xxx.jpg',
  category: 'elements-interaction',
  icon: 'icon-list',
  type: 'AUTO',
  services: [ASSET_ID],
};
export default info;
