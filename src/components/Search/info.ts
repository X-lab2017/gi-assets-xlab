import $i18n from '../../i18n';
const ASSET_ID = 'XlabSearch';
const info = {
  id: ASSET_ID,
  name: $i18n.get({ id: 'gi-assets-xlab.components.Search.info.XlabSearchComponent', dm: 'Xlab 搜索组件' }),
  desc: $i18n.get({ id: 'gi-assets-xlab.components.Search.info.XlabSearchComponent', dm: 'Xlab 搜索组件' }),
  cover: 'http://xxx.jpg',
  category: 'system-interaction',
  icon: 'icon-search',
  type: 'AUTO',
  services: [ASSET_ID, 'CypherQuery'],
};
export default info;
