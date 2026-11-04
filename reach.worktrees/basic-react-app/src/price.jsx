export default function Price({oldPrices,newPrices}) {
    let oldstyles={
            textDecoration:"line-through",
        }
    let newstyles={
            fontWeight:"bold",
    }
    let styles={
        backgroundColor:"#e0c367",
        height:"60px",
        overflow:"hidden",
        // borderBottomLeftRadius:"14px"
        marginBottom:"0px"
    }
     return (
        
         <div style={styles} > 
            <span style={oldstyles} >{oldPrices}</span> 
            &nbsp; &nbsp; &nbsp; &nbsp; 
            <span style={newstyles} >{newPrices}</span>
        </div>  
    );  
        
}