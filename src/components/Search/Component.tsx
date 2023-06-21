import { useContext } from '@antv/gi-sdk';
import { Input } from 'antd';
import React from 'react';
import './index.less';
const { Search } = Input;
const SearchBar = props => {
  const { graph } = useContext();
  console.log('graph', graph);
  return (
    <div>
      <Search />
    </div>
  );
};

export default SearchBar;
