package data;

import dto.RaavareDTO;
import dto.ReceptDTO;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class RaavareDAO implements iRaavareDAO{


    @Override
    public RaavareDTO getRaavare(int raavareId) throws DALException {
        DBconnector dBconnector = new DBconnector();
        RaavareDTO raavareDTO = new RaavareDTO();

        try{
            Statement statement = dBconnector.connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT * FROM Raavarer WHERE RaavareID = "+raavareId+";");
            resultSet.next();
            raavareDTO.setRaavareID(resultSet.getInt(1));
            raavareDTO.setRaavareNavn(resultSet.getString(2));
            raavareDTO.setLeverandoer(resultSet.getString(3));

        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Råvaren med det angivne ID kan ikke findes!",e.getMessage());
        }

        dBconnector.closeConnection();
        return raavareDTO;
    }

    @Override
    public List<RaavareDTO> getRaavareList() throws DALException {
        DBconnector dBconnector = new DBconnector();
        RaavareDTO raavareDTO = new RaavareDTO();
        List<RaavareDTO> raavareDTOList = new ArrayList<>();

        Statement statement = null;

        if (statement == null) {

            try {
                statement = dBconnector.connection.createStatement();
                String queryStatement = "SELECT * FROM Raavarer";
                ResultSet resultSet = statement.executeQuery(queryStatement);
                while (resultSet.next()){
                    raavareDTO.setRaavareID(resultSet.getInt(1));
                    raavareDTO.setRaavareNavn(resultSet.getString(2));
                    raavareDTO.setLeverandoer(resultSet.getString(3));

                    raavareDTOList.add(raavareDTO);
                    raavareDTO = new RaavareDTO();

                }
            } catch (SQLException e) {
                e.printStackTrace();
                throw new DALException("Kunne ikke finde raavarelisten",e.getMessage());
            }
        }
        return raavareDTOList;
    }

    @Override
    public void createRaavare(RaavareDTO raavare) throws DALException {
        DBconnector dBconnector = new DBconnector();

        try {
            Statement statement = dBconnector.connection.createStatement();
            String sqlStatement = "insert into Raavarer values('%d', '%s', '%s');";
            sqlStatement = String.format(sqlStatement,
                    raavare.getRaavareID(),
                    raavare.getRaavareNavn(),
                    raavare.getLeverandoer());
            statement.executeUpdate(sqlStatement);
        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Kunne ikke oprette råvaren",e.getMessage());
        }
       dBconnector.closeConnection();
    }

    @Override
    public void updateRaavare(RaavareDTO raavare) throws DALException {
        DBconnector dBconnector = new DBconnector();

        try {
            Statement statement = dBconnector.connection.createStatement();
            String sqlStatement = "Update Raavarer set raavareNavn = '%s', leverandoer = '%s' where raavareId = '%d';";
            sqlStatement = String.format(sqlStatement,
                    raavare.getRaavareNavn(),
                    raavare.getLeverandoer(),
                    raavare.getRaavareID());
            statement.executeUpdate(sqlStatement);
        }catch (SQLException e){
            e.printStackTrace();
            throw new DALException("Kunne ikke opdatere råvaren",e.getMessage());
        }
        dBconnector.closeConnection();
    }
}
