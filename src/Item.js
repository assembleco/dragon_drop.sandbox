import React, {forwardRef} from 'react';
import styled from "styled-components"

export const Item = forwardRef(({id, ...props}, ref) => {
  return (
    <Box width={2*id} {...props} ref={ref}>{id}</Box>
  )
});

var Box = styled.div`
display: box;
width: ${p => p.width}rem;
height: 4rem;
border: 1px solid #bababa;
margin: 2rem;
text-align: center;
padding-top: 2.5rem;
`
