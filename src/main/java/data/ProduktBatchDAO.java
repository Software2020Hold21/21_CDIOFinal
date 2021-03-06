package data;


import dto.ProduktBatchDTO;
import dto.ProduktBatchKompDTO;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class ProduktBatchDAO implements iProduktBatchDAO {
    private iProduktBatchKompDAO produktBatchKompDAO = new ProduktBatchKompDAO();

    @Override
    public ProduktBatchDTO getProduktBatch(int pbId) throws DALException {
        DBconnector dBconnector = new DBconnector();
        ProduktBatchDTO produktBatchDTO = new ProduktBatchDTO();

        try{
            Statement statement = dBconnector.connection.createStatement();
            String SQLquery = "SELECT * FROM ProduktBatches WHERE pbId ="+pbId+";";
            ResultSet resultSet = statement.executeQuery(SQLquery);
            resultSet.next();

            produktBatchDTO.setPbId(resultSet.getInt(1));
            produktBatchDTO.setStatus(resultSet.getInt(2));
            produktBatchDTO.setReceptId(resultSet.getInt(3));
            produktBatchDTO.setProduktBatchKomponenter(produktBatchKompDAO.getProduktBatchKompList(pbId));

        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Kunne ikke finde produktbatch med det ID",e.getMessage());
        }
        dBconnector.closeConnection();
        return produktBatchDTO;

    }

    @Override
    public List<ProduktBatchDTO> getProduktBatchList() throws DALException {
        DBconnector dBconnector = new DBconnector();
        ProduktBatchDTO produktBatchDTO = new ProduktBatchDTO();
        List<ProduktBatchDTO> produktBatchDTOList = new ArrayList<ProduktBatchDTO>();

        try{
            Statement statement = dBconnector.connection.createStatement();
            String SQLquery = "SELECT * FROM ProduktBatches;";
            ResultSet resultSet = statement.executeQuery(SQLquery);
            while (resultSet.next()){
                produktBatchDTO.setPbId(resultSet.getInt(1));
                produktBatchDTO.setStatus(resultSet.getInt(2));
                produktBatchDTO.setReceptId(resultSet.getInt(3));
                produktBatchDTO.setProduktBatchKomponenter(produktBatchKompDAO.getProduktBatchKompList(resultSet.getInt(1)));
                produktBatchDTOList.add(produktBatchDTO);
                produktBatchDTO = new ProduktBatchDTO();
            }


        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Kunne ikke finde listen af produktbatches",e.getMessage());
        }
        dBconnector.closeConnection();
        return produktBatchDTOList;
    }

    @Override
    public void createProduktBatch(ProduktBatchDTO produktbatch) throws DALException {
        DBconnector dBconnector = new DBconnector();

        try {
            Statement statement = dBconnector.connection.createStatement();
            //Create String for the SQL Insert Statement
            String SQLstatement = "insert into ProduktBatches values('%d', '%d', '%d');";
            //Format the string
            SQLstatement =String.format(SQLstatement,
                    produktbatch.getPbId(),
                    produktbatch.getStatus(),
                    produktbatch.getReceptId()); //Assume that the recept has already been created

            //Execute the insert statement
            statement.executeUpdate(SQLstatement);

            //Insert the components of the produktBatch in the database
            //Add each element from the list to the database
            if (!produktbatch.getProduktBatchKomponenter().isEmpty()){
                for (ProduktBatchKompDTO pbkDTO: produktbatch.getProduktBatchKomponenter()) {
                    produktBatchKompDAO.createProduktBatchKomp(pbkDTO);
                }
            }



        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Kunne ikke oprette bruger med det ID",e.getMessage());
        }

        dBconnector.closeConnection();
    }

    @Override
    public void updateProduktBatch(ProduktBatchDTO produktbatch) throws DALException {
        DBconnector dBconnector = new DBconnector();

        try {
            Statement statement = dBconnector.connection.createStatement();
            //Create String for the SQL Insert Statement
            String SQLstatement = "UPDATE ProduktBatches SET receptId = '%d' , statuss = '%d' WHERE pbId = '%d';";
            //Format the string
            SQLstatement =String.format(SQLstatement,
                    produktbatch.getReceptId(), //Assume that the recept has already been created
                    produktbatch.getStatus(),
                    produktbatch.getPbId());

            //Execute the insert statement
            statement.executeUpdate(SQLstatement);

            //Update the components of the recept in the database
            if (!produktbatch.getProduktBatchKomponenter().isEmpty()){
                for (ProduktBatchKompDTO pbkDTO: produktbatch.getProduktBatchKomponenter()) {
                    produktBatchKompDAO.updateProduktBatchKomp(pbkDTO);
                }
            }



        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Kunne ikke opdatere produktbatchen.",e.getMessage());
        }

        dBconnector.closeConnection();
    }
}
